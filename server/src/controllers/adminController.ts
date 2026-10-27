import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';
import { config } from '../config/index.js';
import { RequestWithUser } from '../middleware/auth.js';

/**
 * Dedicated Admin Portal Login
 * Rejects non-admin / non-staff users even with valid password.
 */
export async function adminLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Admin email and master access key are required.' });
    return;
  }

  try {
    const userRes = await pool.query(
      `SELECT id, email, password_hash, full_name, student_id, department, role, avatar_url
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Invalid admin credentials or unauthorized account.' });
      return;
    }

    const user = userRes.rows[0];

    // Explicit role authorization check
    if (user.role !== 'admin' && user.role !== 'security_staff') {
      res.status(403).json({ error: 'Access Denied: This portal is restricted to authorized Security & Admin staff only.' });
      return;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Invalid admin credentials or master access key.' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        studentId: user.student_id,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    // Audit log admin login
    await pool.query(
      `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'ADMIN_LOGIN', 'auth', $2, $3)`,
      [user.id, String(user.id), JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] })]
    );

    res.json({
      message: 'Admin authorization granted.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        studentId: user.student_id,
        department: user.department,
        role: user.role,
        avatarUrl: user.avatar_url
      }
    });
  } catch (err: any) {
    console.error('adminLogin error:', err);
    res.status(500).json({ error: 'Admin authentication service error.' });
  }
}


/**
 * Admin Dashboard Stats - Aggregates real-time metrics from DB
 * Only accessible to admin / security_staff roles.
 */
export async function getAdminStats(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'security_staff')) {
    res.status(403).json({ error: 'Forbidden: Admin access required.' });
    return;
  }

  try {
    // All queries in parallel for performance
    const [
      totalReportsRes,
      statusBreakdownRes,
      typeBreakdownRes,
      claimsStatsRes,
      categoryBreakdownRes,
      recentReportsRes,
      recentAuditRes,
      recoveryRateRes,
      weeklyTrendRes,
    ] = await Promise.all([
      // 1. Total reports count
      pool.query('SELECT COUNT(*) as total FROM reports'),

      // 2. Status breakdown
      pool.query(`
        SELECT status, COUNT(*) as count 
        FROM reports 
        GROUP BY status 
        ORDER BY count DESC
      `),

      // 3. Type breakdown (lost vs found)
      pool.query(`
        SELECT type, COUNT(*) as count 
        FROM reports 
        GROUP BY type
      `),

      // 4. Claims statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_claims,
          COUNT(*) FILTER (WHERE status IN ('Submitted', 'Under Review')) as pending,
          COUNT(*) FILTER (WHERE status = 'Approved') as approved,
          COUNT(*) FILTER (WHERE status = 'Item Returned') as returned,
          COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
          COUNT(*) FILTER (WHERE status = 'More Information Required') as needs_info
        FROM claims
      `),

      // 5. Category breakdown
      pool.query(`
        SELECT category, COUNT(*) as count 
        FROM reports 
        GROUP BY category 
        ORDER BY count DESC 
        LIMIT 8
      `),

      // 6. Recent reports (last 10)
      pool.query(`
        SELECT r.id, r.reference_number, r.title, r.type, r.category, 
               r.location, r.status, r.image_url,
               TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
               u.full_name as reporter_name
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        ORDER BY r.created_at DESC
        LIMIT 10
      `),

      // 7. Recent audit events (last 15)
      pool.query(`
        SELECT ae.id, ae.action, ae.entity_type, ae.entity_id, ae.metadata,
               TO_CHAR(ae.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
               u.full_name as actor_name
        FROM audit_events ae
        LEFT JOIN users u ON ae.actor_id = u.id
        ORDER BY ae.created_at DESC
        LIMIT 15
      `),

      // 8. Recovery rate (resolved / total found items)
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE type = 'found') as total_found,
          COUNT(*) FILTER (WHERE type = 'found' AND status = 'resolved') as found_resolved
        FROM reports
      `),

      // 9. Weekly trend (last 4 weeks)
      pool.query(`
        SELECT 
          DATE_TRUNC('week', created_at) as week_start,
          COUNT(*) as reports_count,
          COUNT(*) FILTER (WHERE type = 'lost') as lost_count,
          COUNT(*) FILTER (WHERE type = 'found') as found_count
        FROM reports
        WHERE created_at >= NOW() - INTERVAL '4 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week_start DESC
      `),
    ]);

    const totalFound = parseInt(recoveryRateRes.rows[0]?.total_found || '0');
    const foundResolved = parseInt(recoveryRateRes.rows[0]?.found_resolved || '0');
    const recoveryRate = totalFound > 0 ? Math.round((foundResolved / totalFound) * 100) : 0;

    res.json({
      stats: {
        totalReports: parseInt(totalReportsRes.rows[0].total),
        statusBreakdown: statusBreakdownRes.rows,
        typeBreakdown: typeBreakdownRes.rows,
        claims: claimsStatsRes.rows[0],
        categoryBreakdown: categoryBreakdownRes.rows,
        recoveryRate,
        weeklyTrend: weeklyTrendRes.rows,
      },
      recentReports: recentReportsRes.rows,
      auditLog: recentAuditRes.rows,
    });
  } catch (err: any) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin dashboard stats.' });
  }
}

/**
 * Update report status (admin-only operations like dispose, police custody, archive)
 */
export async function adminUpdateReportStatus(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'security_staff')) {
    res.status(403).json({ error: 'Forbidden: Admin access required.' });
    return;
  }

  const { reportId } = req.params;
  const { status, adminNotes } = req.body;

  const validStatuses = ['open', 'claimed', 'under_review', 'resolved', 'archived'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status value.' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE reports 
       SET status = $1, private_admin_notes = COALESCE($2, private_admin_notes), updated_at = CURRENT_TIMESTAMP 
       WHERE id::text = $3 OR reference_number = $3
       RETURNING *`,
      [status, adminNotes || null, reportId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'ADMIN_STATUS_CHANGE', 'report', $2, $3)`,
      [req.user.id, result.rows[0].id, JSON.stringify({ newStatus: status, adminNotes })]
    );

    res.json({ message: `Report status updated to ${status}.`, report: result.rows[0] });
  } catch (err: any) {
    console.error('adminUpdateReportStatus error:', err);
    res.status(500).json({ error: 'Failed to update report status.' });
  }
}

/**
 * Get registered users list with report and claim statistics (for Admin Panel)
 */
export async function getAdminUsers(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'security_staff')) {
    res.status(403).json({ error: 'Forbidden: Admin access required.' });
    return;
  }

  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.student_id,
        u.department,
        u.role,
        u.phone_number,
        TO_CHAR(u.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        COUNT(DISTINCT r.id) FILTER (WHERE r.type = 'found') as found_count,
        COUNT(DISTINCT r.id) FILTER (WHERE r.type = 'lost') as lost_count,
        COUNT(DISTINCT c.id) as claims_count
      FROM users u
      LEFT JOIN reports r ON u.id = r.reporter_id
      LEFT JOIN claims c ON u.id = c.claimant_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (err: any) {
    console.error('getAdminUsers error:', err);
    res.status(500).json({ error: 'Failed to retrieve registered users list.' });
  }
}

