import { Response } from 'express';
import { pool } from '../db/index.js';
import { RequestWithUser } from '../middleware/auth.js';
import { sendClaimEventToSQS, publishClaimNotificationSNS } from '../services/awsMessagingService.js';

/**
 * 4.C Ownership Claims - Strict Security and Business Logic:
 * 1. Authenticated users only
 * 2. Reporter cannot claim their own item (Self-claim prevention)
 * 3. Resolved, returned, or closed items cannot be claimed
 * 4. Prevent duplicate active claims by the same claimant on the same item
 * 5. Claimant submits private explanation/evidence
 * 6. Private verification information kept out of public listings
 * 7. Authorized finder or admin approves or rejects claims
 * 8. Strict database transaction (SELECT FOR UPDATE) prevents race-conditions/simultaneous competing approvals
 * 9. Only ONE claim can be approved for an item
 * 10. Allows marking an item as returned after handover
 * 11. Allows reopening a listing if an approved claim is cancelled
 */

export async function submitClaim(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required to submit claims.' });
    return;
  }

  const { reportId, proofDetails, evidenceImageUrl } = req.body;

  if (!reportId || !proofDetails || proofDetails.trim().length < 5) {
    res.status(400).json({ error: 'Valid report ID and detailed ownership explanation (min 5 characters) are required.' });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch report details with row lock
    const reportRes = await client.query(
      `SELECT id, title, type, status, reporter_id FROM reports WHERE id = $1 FOR SHARE`,
      [reportId]
    );

    if (reportRes.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Target item report not found.' });
      return;
    }

    const report = reportRes.rows[0];

    // Rule 2: Reporter cannot claim their own item
    if (report.reporter_id === req.user.id) {
      await client.query('ROLLBACK');
      res.status(403).json({ error: 'You cannot submit an ownership claim for an item you reported.' });
      return;
    }

    // Rule 3: Only found items that are open or under_review can be claimed
    if (report.status === 'resolved' || report.status === 'archived') {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'This item has already been returned or closed and cannot be claimed.' });
      return;
    }

    // Rule 4: Prevent duplicate active claims by the same user for the same item
    const existingClaimRes = await client.query(
      `SELECT id, claim_reference, status FROM claims 
       WHERE report_id = $1 AND claimant_id = $2 AND status NOT IN ('Rejected')`,
      [reportId, req.user.id]
    );

    if (existingClaimRes.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({
        error: 'You already have an active claim under review for this item.',
        existingClaimReference: existingClaimRes.rows[0].claim_reference
      });
      return;
    }

    const claimReference = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert claim record
    const claimRes = await client.query(
      `INSERT INTO claims (claim_reference, report_id, claimant_id, proof_details, status)
       VALUES ($1, $2, $3, $4, 'Submitted')
       RETURNING *`,
      [claimReference, reportId, req.user.id, proofDetails.trim()]
    );

    // Update report status to under_review if currently open
    if (report.status === 'open') {
      await client.query(
        `UPDATE reports SET status = 'under_review', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [reportId]
      );
    }

    // Claimant in-app notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, target_report_id)
       VALUES ($1, $2, $3, 'claim', $4)`,
      [
        req.user.id,
        'Claim Submitted for Review',
        `Your ownership claim (${claimReference}) for "${report.title}" has been submitted for verification.`,
        reportId
      ]
    );

    // Notify item finder
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, target_report_id)
       VALUES ($1, $2, $3, 'claim', $4)`,
      [
        report.reporter_id,
        'New Ownership Claim Received',
        `A student submitted an ownership claim (${claimReference}) for "${report.title}".`,
        reportId
      ]
    );

    // Audit Event
    await client.query(
      `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'SUBMIT_CLAIM', 'claim', $2, $3)`,
      [req.user.id, claimRes.rows[0].id, JSON.stringify({ claimReference, reportId, hasEvidenceImage: Boolean(evidenceImageUrl) })]
    );

    await client.query('COMMIT');

    // Trigger AWS SQS Asynchronous event
    await sendClaimEventToSQS({
      eventId: `EVT-${Date.now()}`,
      eventType: 'CLAIM_SUBMITTED',
      claimId: claimRes.rows[0].id,
      claimReference,
      reportId,
      itemTitle: report.title,
      claimantId: req.user.id,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Claim filed successfully. Verification is in progress.',
      claim: claimRes.rows[0]
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('submitClaim error:', err);
    res.status(500).json({ error: 'Failed to process claim submission.' });
  } finally {
    client.release();
  }
}

export async function getClaims(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const isAdmin = req.user.role === 'admin' || req.user.role === 'security_staff';

  try {
    let queryText = `
      SELECT
        c.id,
        c.claim_reference,
        c.report_id,
        c.proof_details,
        c.status,
        c.admin_notes,
        c.created_at,
        r.title as item_title,
        r.location as item_location,
        r.type as item_type,
        r.category as item_category,
        r.image_url as item_image_url,
        r.reference_number as item_reference_number,
        r.description as item_description,
        r.status as report_status,
        r.reporter_id,
        u.full_name as claimant_name,
        u.email as claimant_email,
        u.student_id as claimant_student_id,
        u.phone_number as claimant_phone
      FROM claims c
      JOIN reports r ON c.report_id = r.id
      JOIN users u ON c.claimant_id = u.id
    `;

    const params: any[] = [];
    if (!isAdmin) {
      // Students can only see claims they filed OR claims made on items they found/reported
      queryText += ' WHERE (c.claimant_id = $1 OR r.reporter_id = $1)';
      params.push(req.user.id);
    }

    queryText += ' ORDER BY c.created_at DESC';

    const claimsRes = await pool.query(queryText, params);
    res.json({ claims: claimsRes.rows });
  } catch (err: any) {
    console.error('getClaims error:', err);
    res.status(500).json({ error: 'Failed to retrieve claims.' });
  }
}

/**
 * Review Claim: Approve, Reject, or Request Info
 * Uses conditional transaction with row locks to ensure:
 * 1. ONLY ONE claim can ever be approved for an item.
 * 2. Competing simultaneous approvals cannot both succeed.
 */
export async function reviewClaim(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const { claimId } = req.params;
  const { status, adminNotes } = req.body;

  const validStatuses = ['Under Review', 'More Information Required', 'Approved', 'Rejected', 'Item Returned'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid claim status.' });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock claim row for update
    const claimRes = await client.query(
      `SELECT c.id, c.report_id, c.claimant_id, c.claim_reference, c.status as current_claim_status,
              r.title, r.status as report_status, r.reporter_id
       FROM claims c
       JOIN reports r ON c.report_id = r.id
       WHERE c.id::text = $1 OR c.claim_reference = $1
       FOR UPDATE OF c`,
      [claimId]
    );

    if (claimRes.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Claim record not found.' });
      return;
    }

    const claim = claimRes.rows[0];

    // Authorization: Must be admin or original finder/reporter
    const isAdmin = req.user.role === 'admin' || req.user.role === 'security_staff';
    const isReporter = claim.reporter_id === req.user.id;
    if (!isAdmin && !isReporter) {
      await client.query('ROLLBACK');
      res.status(403).json({ error: 'Forbidden. Only the item finder or admin can review this claim.' });
      return;
    }

    // Rule 10 & 11: If approving, lock the parent report row and verify no competing claim has already been approved
    if (status === 'Approved') {
      const reportLock = await client.query(
        `SELECT id, status FROM reports WHERE id = $1 FOR UPDATE`,
        [claim.report_id]
      );

      if (reportLock.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Parent report not found.' });
        return;
      }

      if (reportLock.rows[0].status === 'resolved' || reportLock.rows[0].status === 'claimed') {
        await client.query('ROLLBACK');
        res.status(409).json({ error: 'Conflict: This item has already been approved or resolved with another claimant.' });
        return;
      }

      // Check if another claim is already approved for this report
      const competingApproved = await client.query(
        `SELECT id, claim_reference FROM claims WHERE report_id = $1 AND status IN ('Approved', 'Item Returned') AND id != $2`,
        [claim.report_id, claim.id]
      );

      if (competingApproved.rows.length > 0) {
        await client.query('ROLLBACK');
        res.status(409).json({
          error: `Another claim (${competingApproved.rows[0].claim_reference}) has already been approved for this item.`
        });
        return;
      }

      // Automatically reject or archive all competing pending claims for this report
      await client.query(
        `UPDATE claims 
         SET status = 'Rejected', admin_notes = 'Closed: Another claimant verification was approved', updated_at = CURRENT_TIMESTAMP
         WHERE report_id = $1 AND id != $2 AND status IN ('Submitted', 'Under Review', 'More Information Required')`,
        [claim.report_id, claim.id]
      );

      // Update report status to claimed
      await client.query(
        `UPDATE reports SET status = 'claimed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [claim.report_id]
      );
    }

    // Rule 13: Allow marking an item as returned after handover
    if (status === 'Item Returned') {
      await client.query(
        `UPDATE reports SET status = 'resolved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [claim.report_id]
      );
    }

    // Update claim status
    const updateRes = await client.query(
      `UPDATE claims
       SET status = $1, admin_notes = COALESCE($2, admin_notes), verified_by = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, adminNotes || null, req.user.id, claim.id]
    );

    // In-app notification for claimant
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, target_report_id)
       VALUES ($1, $2, $3, 'claim', $4)`,
      [
        claim.claimant_id,
        `Claim Update: ${status}`,
        `Your claim for "${claim.title}" is now marked as "${status}". ${adminNotes ? 'Notes: ' + adminNotes : ''}`,
        claim.report_id
      ]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'REVIEW_CLAIM', 'claim', $2, $3)`,
      [req.user.id, claim.id, JSON.stringify({ status, adminNotes, claimReference: claim.claim_reference })]
    );

    await client.query('COMMIT');

    // Trigger AWS SQS Asynchronous message
    await sendClaimEventToSQS({
      eventId: `EVT-${Date.now()}`,
      eventType: status === 'Approved' ? 'CLAIM_APPROVED' : status === 'Item Returned' ? 'ITEM_RETURNED' : 'CLAIM_REJECTED',
      claimId: claim.id,
      claimReference: claim.claim_reference,
      reportId: claim.report_id,
      itemTitle: claim.title,
      claimantId: claim.claimant_id,
      timestamp: new Date().toISOString()
    });

    // Trigger AWS SNS Notification (omits any private claim proof/evidence)
    if (status === 'Approved' || status === 'Rejected' || status === 'Item Returned') {
      await publishClaimNotificationSNS(
        `CampusFind: Claim ${status} for "${claim.title}"`,
        `Notification from CampusFind:\n\nClaim Reference: ${claim.claim_reference}\nItem: ${claim.title}\nNew Status: ${status}\nDecision timestamp: ${new Date().toUTCString()}\n\nPlease check your CampusFind dashboard for handover details.`
      );
    }

    res.json({
      message: `Claim successfully updated to ${status}.`,
      claim: updateRes.rows[0]
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('reviewClaim error:', err);
    res.status(500).json({ error: 'Failed to update claim review.' });
  } finally {
    client.release();
  }
}

/**
 * Reopen a listing if an approved claim is cancelled or item was never picked up
 */
export async function reopenReport(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'security_staff')) {
    res.status(403).json({ error: 'Only administrative staff can reopen closed listings.' });
    return;
  }

  const { reportId } = req.params;

  try {
    const reportRes = await pool.query(
      `UPDATE reports SET status = 'open', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [reportId]
    );

    if (reportRes.rows.length === 0) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    await pool.query(
      `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'REOPEN_REPORT', 'report', $2, '{}')`,
      [req.user.id, reportId]
    );

    res.json({ message: 'Listing has been reopened for public viewing and new claims.', report: reportRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reopen listing.' });
  }
}
