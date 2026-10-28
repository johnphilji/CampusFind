/**
 * CampusFind — Automatic Data Retention Service
 *
 * Rule A (7-day):  Claims marked 'Item Returned' are fully deleted (including
 *                  associated S3 photo) 7 days after the admin records handover
 *                  via the returned_at timestamp.
 *
 * Rule B (30-day): Reports that are still 'open' (never received an approved or
 *                  returned claim) are archived 30 days after their creation date.
 *                  Items with ANY active (non-rejected) pending claim at the
 *                  30-day boundary are NOT deleted — they stay in review.
 *
 * Safety properties:
 *  - Idempotent: running multiple times never double-deletes or errors.
 *  - Graceful S3 failures: a missing S3 object is logged but does not stop
 *    the database cleanup.
 *  - Rule A and Rule B cannot race: the queries are mutually exclusive by status.
 *  - Never touches production data during local dev (S3 delete is no-op when
 *    bucketName is not configured).
 *  - Every action is written to audit_events so admins have a complete trail.
 */

import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { pool } from '../db/index.js';
import { config } from '../config/index.js';

// ---------------------------------------------------------------------------
// S3 client — reuses the same pattern as storageService.ts
// ---------------------------------------------------------------------------
const s3Client = new S3Client({
  region: config.aws.region,
  ...(config.aws.accessKeyId && config.aws.secretAccessKey
    ? {
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      }
    : {}),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the S3 object key from a stored image_url.
 * image_url is stored as '/api/images/items/timestamp-name.jpg' when using S3,
 * or as an external URL (e.g. Unsplash). Returns null for external URLs.
 */
function extractS3Key(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || !imageUrl.startsWith('/api/images/')) return null;
  return imageUrl.replace('/api/images/', '');
}

/**
 * Attempt to delete an S3 object. Logs failures but never throws.
 * Returns true if deleted (or key was absent), false on error.
 */
async function deleteS3Object(key: string): Promise<boolean> {
  if (!config.aws.bucketName) {
    console.log(`[Retention] S3 bucket not configured — skipping S3 delete for key: ${key}`);
    return true; // treat as success in local dev
  }
  try {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: config.aws.bucketName, Key: key })
    );
    return true;
  } catch (err: any) {
    // NoSuchKey is fine — object already gone
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) return true;
    console.error(`[Retention] S3 delete failed for key '${key}':`, err.message);
    return false;
  }
}

/**
 * Write an audit event; never throws so that a log failure doesn't abort cleanup.
 */
async function auditLog(action: string, entityType: string, entityId: string, metadata: object): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_events (action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4)`,
      [action, entityType, entityId, JSON.stringify(metadata)]
    );
  } catch (logErr: any) {
    console.error('[Retention] Failed to write audit log:', logErr.message);
  }
}

// ---------------------------------------------------------------------------
// Rule A — Delete claimed-and-returned items after 7 days
// ---------------------------------------------------------------------------
async function applyRuleA(): Promise<void> {
  console.log('[Retention] Running Rule A: 7-day cleanup for returned items...');

  // Find reports that were resolved via a verified handover 7+ days ago.
  // We look at the claim's returned_at timestamp (set by reviewClaim when
  // admin marks status = 'Item Returned').
  const ruleAQuery = await pool.query<{
    report_id: string;
    claim_id: string;
    image_url: string | null;
    claim_reference: string;
    returned_at: string;
  }>(`
    SELECT
      r.id          AS report_id,
      c.id          AS claim_id,
      r.image_url,
      c.claim_reference,
      c.returned_at
    FROM claims c
    JOIN reports r ON c.report_id = r.id
    WHERE c.status = 'Item Returned'
      AND c.returned_at IS NOT NULL
      AND c.returned_at < NOW() - INTERVAL '7 days'
      AND r.status = 'resolved'
    ORDER BY c.returned_at ASC
  `);

  if (ruleAQuery.rows.length === 0) {
    console.log('[Retention] Rule A: no items due for deletion.');
    return;
  }

  console.log(`[Retention] Rule A: ${ruleAQuery.rows.length} item(s) eligible for deletion.`);

  for (const row of ruleAQuery.rows) {
    const { report_id, claim_id, image_url, claim_reference, returned_at } = row;

    // Delete S3 photo (best-effort; log failure but proceed)
    const s3Key = extractS3Key(image_url);
    let s3Deleted = true;
    if (s3Key) {
      s3Deleted = await deleteS3Object(s3Key);
      if (!s3Deleted) {
        await auditLog('RETENTION_S3_FAILURE', 'report', report_id, {
          rule: 'A',
          s3Key,
          claim_reference,
          returned_at,
        });
        // Continue with DB cleanup even if S3 failed — the row is the source of truth.
      }
    }

    // Delete the report (CASCADE deletes associated claims and notifications)
    try {
      await pool.query(`DELETE FROM reports WHERE id = $1 AND status = 'resolved'`, [report_id]);
      await auditLog('RETENTION_DELETED', 'report', report_id, {
        rule: 'A',
        claim_reference,
        returned_at,
        s3Key: s3Key || 'none',
        s3Deleted,
      });
      console.log(`[Retention] Rule A: deleted report ${report_id} (claim ${claim_reference}, returned ${returned_at}).`);
    } catch (dbErr: any) {
      console.error(`[Retention] Rule A: DB delete failed for report ${report_id}:`, dbErr.message);
      await auditLog('RETENTION_DB_FAILURE', 'report', report_id, {
        rule: 'A',
        claim_reference,
        error: dbErr.message,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Rule B — Archive unclaimed items after 30 days
// ---------------------------------------------------------------------------
async function applyRuleB(): Promise<void> {
  console.log('[Retention] Running Rule B: 30-day cleanup for unclaimed items...');

  // Find items that:
  //  1. Are still 'open' (never moved to claimed/resolved)
  //  2. Were created more than 30 days ago
  //  3. Have NO non-rejected claims (not even pending ones — we preserve items
  //     that are actively under review at the 30-day boundary)
  const ruleBQuery = await pool.query<{
    report_id: string;
    image_url: string | null;
    reference_number: string;
    created_at: string;
  }>(`
    SELECT
      r.id          AS report_id,
      r.image_url,
      r.reference_number,
      r.created_at
    FROM reports r
    WHERE r.status = 'open'
      AND r.created_at < NOW() - INTERVAL '30 days'
      AND NOT EXISTS (
        SELECT 1 FROM claims c
        WHERE c.report_id = r.id
          AND c.status NOT IN ('Rejected')
      )
    ORDER BY r.created_at ASC
  `);

  if (ruleBQuery.rows.length === 0) {
    console.log('[Retention] Rule B: no items due for archival.');
    return;
  }

  console.log(`[Retention] Rule B: ${ruleBQuery.rows.length} item(s) eligible for archival.`);

  for (const row of ruleBQuery.rows) {
    const { report_id, image_url, reference_number, created_at } = row;

    // Delete S3 photo (best-effort)
    const s3Key = extractS3Key(image_url);
    let s3Deleted = true;
    if (s3Key) {
      s3Deleted = await deleteS3Object(s3Key);
      if (!s3Deleted) {
        await auditLog('RETENTION_S3_FAILURE', 'report', report_id, {
          rule: 'B',
          s3Key,
          reference_number,
          created_at,
        });
      }
    }

    // Mark as archived (keeps the row for audit purposes but hides from listings)
    try {
      await pool.query(
        `UPDATE reports SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'open'`,
        [report_id]
      );
      await auditLog('RETENTION_ARCHIVED', 'report', report_id, {
        rule: 'B',
        reference_number,
        created_at,
        s3Key: s3Key || 'none',
        s3Deleted,
      });
      console.log(`[Retention] Rule B: archived report ${reference_number} (created ${created_at}).`);
    } catch (dbErr: any) {
      console.error(`[Retention] Rule B: DB archive failed for report ${report_id}:`, dbErr.message);
      await auditLog('RETENTION_DB_FAILURE', 'report', report_id, {
        rule: 'B',
        reference_number,
        error: dbErr.message,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run both retention rules once. Safe to call multiple times — idempotent.
 * Errors in one rule do not abort the other.
 */
export async function runRetentionCleanup(): Promise<void> {
  const started = new Date().toISOString();
  console.log(`[Retention] Cleanup started at ${started}`);
  try {
    await applyRuleA();
  } catch (err: any) {
    console.error('[Retention] Rule A threw an unexpected error:', err.message);
    await auditLog('RETENTION_ERROR', 'system', 'rule-a', { error: err.message, started });
  }
  try {
    await applyRuleB();
  } catch (err: any) {
    console.error('[Retention] Rule B threw an unexpected error:', err.message);
    await auditLog('RETENTION_ERROR', 'system', 'rule-b', { error: err.message, started });
  }
  console.log('[Retention] Cleanup finished.');
}

/**
 * Start the retention scheduler. Runs every 6 hours.
 * First run is deferred 60 seconds after startup to let the DB settle.
 */
export function startRetentionScheduler(intervalMs: number = 6 * 60 * 60 * 1000): void {
  console.log('[Retention] Scheduler initialized — first run in 60 seconds, then every 6 hours.');
  // Defer first run slightly so the server is fully started before hitting DB
  setTimeout(() => {
    runRetentionCleanup();
    setInterval(runRetentionCleanup, intervalMs);
  }, 60 * 1000);
}
