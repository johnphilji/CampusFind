import { Response } from 'express';
import { pool } from '../db/index.js';
import { RequestWithUser } from '../middleware/auth.js';

export async function submitClaim(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required to submit claims.' });
    return;
  }

  const { reportId, proofDetails } = req.body;

  if (!reportId || !proofDetails || proofDetails.trim().length < 5) {
    res.status(400).json({ error: 'Valid report ID and detailed ownership proof are required.' });
    return;
  }

  const claimReference = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    // Check if report exists
    const reportRes = await pool.query('SELECT id, title, status FROM reports WHERE id = $1', [reportId]);
    if (reportRes.rows.length === 0) {
      res.status(404).json({ error: 'Target report not found.' });
      return;
    }

    const report = reportRes.rows[0];

    // Insert claim
    const claimRes = await pool.query(
      `INSERT INTO claims (claim_reference, report_id, claimant_id, proof_details, status)
       VALUES ($1, $2, $3, $4, 'Submitted')
       RETURNING *`,
      [claimReference, reportId, req.user.id, proofDetails.trim()]
    );

    // Update report status to under_review
    await pool.query('UPDATE reports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['under_review', reportId]);

    // Student notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, target_report_id)
       VALUES ($1, $2, $3, 'claim', $4)`,
      [
        req.user.id,
        'Claim Submitted for Review',
        `Your ownership claim (${claimReference}) for "${report.title}" is being verified by Admin Desk.`,
        reportId
      ]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'SUBMIT_CLAIM', 'claim', $2, $3)`,
      [req.user.id, claimRes.rows[0].id, JSON.stringify({ claimReference, reportId })]
    );

    res.status(201).json({
      message: 'Claim filed successfully for administrator verification.',
      claim: claimRes.rows[0]
    });
  } catch (err: any) {
    console.error('submitClaim error:', err);
    res.status(500).json({ error: 'Failed to process claim.' });
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
        u.full_name as claimant_name,
        u.email as claimant_email,
        u.student_id as claimant_student_id
      FROM claims c
      JOIN reports r ON c.report_id = r.id
      JOIN users u ON c.claimant_id = u.id
    `;

    const params: any[] = [];
    if (!isAdmin) {
      // Students only see their own claims
      queryText += ' WHERE c.claimant_id = $1';
      params.push(req.user.id);
    }

    queryText += ' ORDER BY c.created_at DESC';

    const claimsRes = await pool.query(queryText, params);
    res.json({ claims: claimsRes.rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve claims.' });
  }
}

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

  try {
    const claimRes = await pool.query(
      `SELECT c.id, c.report_id, c.claimant_id, c.claim_reference, r.title
       FROM claims c
       JOIN reports r ON c.report_id = r.id
       WHERE c.id::text = $1 OR c.claim_reference = $1`,
      [claimId]
    );

    if (claimRes.rows.length === 0) {
      res.status(404).json({ error: 'Claim record not found.' });
      return;
    }

    const claim = claimRes.rows[0];

    // Update claim status
    const updateRes = await pool.query(
      `UPDATE claims
       SET status = $1, admin_notes = COALESCE($2, admin_notes), verified_by = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, adminNotes || null, req.user.id, claim.id]
    );

    // If approved or returned, update report status
    if (status === 'Item Returned' || status === 'Approved') {
      await pool.query('UPDATE reports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['resolved', claim.report_id]);
    }

    // Notify claimant
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, target_report_id)
       VALUES ($1, $2, $3, 'claim', $4)`,
      [
        claim.claimant_id,
        `Claim ${status}`,
        `Status of your claim for "${claim.title}" is now "${status}".`,
        claim.report_id
      ]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'REVIEW_CLAIM', 'claim', $2, $3)`,
      [req.user.id, claim.id, JSON.stringify({ status, adminNotes })]
    );

    res.json({
      message: `Claim successfully updated to ${status}.`,
      claim: updateRes.rows[0]
    });
  } catch (err: any) {
    console.error('reviewClaim error:', err);
    res.status(500).json({ error: 'Failed to update claim.' });
  }
}
