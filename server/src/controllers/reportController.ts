import { Response } from 'express';
import { pool } from '../db/index.js';
import { RequestWithUser } from '../middleware/auth.js';

export async function getReports(req: RequestWithUser, res: Response): Promise<void> {
  const { type, category, location, search, status, page = '1', limit = '20' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const offset = (pageNum - 1) * limitNum;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (type && (type === 'lost' || type === 'found')) {
    conditions.push(`r.type = $${paramIdx++}`);
    values.push(type);
  }

  if (category && category !== 'All') {
    conditions.push(`r.category = $${paramIdx++}`);
    values.push(category);
  }

  if (location && location !== 'All') {
    conditions.push(`r.location ILIKE $${paramIdx++}`);
    values.push(`%${location}%`);
  }

  if (status && status !== 'All') {
    conditions.push(`r.status = $${paramIdx++}`);
    values.push(status);
  }

  if (search) {
    conditions.push(`(r.title ILIKE $${paramIdx} OR r.description ILIKE $${paramIdx} OR r.reference_number ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    // Count query
    const countRes = await pool.query(`SELECT COUNT(*) FROM reports r ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    // Data query with reporter details (protecting private info)
    const dataQuery = `
      SELECT
        r.id,
        r.reference_number,
        r.title,
        r.type,
        r.category,
        r.location,
        TO_CHAR(r.report_date, 'YYYY-MM-DD') as report_date,
        r.description,
        r.image_url,
        r.status,
        r.identifying_question,
        r.created_at,
        u.full_name as reporter_name,
        u.department as reporter_department
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;

    const dataRes = await pool.query(dataQuery, [...values, limitNum, offset]);

    res.json({
      data: dataRes.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    console.error('getReports error:', err);
    res.status(500).json({ error: 'Failed to retrieve reports.' });
  }
}

export async function getReportById(req: RequestWithUser, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const reportRes = await pool.query(
      `SELECT
        r.id,
        r.reference_number,
        r.title,
        r.type,
        r.category,
        r.location,
        TO_CHAR(r.report_date, 'YYYY-MM-DD') as report_date,
        r.description,
        r.image_url,
        r.status,
        r.identifying_question,
        r.created_at,
        u.full_name as reporter_name,
        u.department as reporter_department
       FROM reports r
       LEFT JOIN users u ON r.reporter_id = u.id
       WHERE r.id::text = $1 OR r.reference_number = $1`,
      [id]
    );

    if (reportRes.rows.length === 0) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    res.json({ report: reportRes.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve item record.' });
  }
}

export async function createReport(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required to file reports.' });
    return;
  }

  const { title, type, category, location, reportDate, description, imageUrl, identifyingQuestion } = req.body;

  if (!title || !type || !category || !location || !description) {
    res.status(400).json({ error: 'Missing required report fields.' });
    return;
  }

  const referenceNumber = `CF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const insertRes = await pool.query(
      `INSERT INTO reports
        (reference_number, title, type, category, location, report_date, description, image_url, status, reporter_id, identifying_question)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', $9, $10)
       RETURNING *`,
      [
        referenceNumber,
        title.trim(),
        type,
        category,
        location,
        reportDate || new Date().toISOString().split('T')[0],
        description.trim(),
        imageUrl || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
        req.user.id,
        identifyingQuestion || null
      ]
    );

    const report = insertRes.rows[0];

    // Create confirmation notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, target_report_id)
       VALUES ($1, $2, $3, 'report', $4)`,
      [
        req.user.id,
        `${type === 'lost' ? 'Lost' : 'Found'} Item Registered`,
        `Your report for "${title}" has been published with reference ${referenceNumber}.`,
        report.id
      ]
    );

    // Audit Event
    await pool.query(
      `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'CREATE_REPORT', 'report', $2, $3)`,
      [req.user.id, report.id, JSON.stringify({ referenceNumber, type, title })]
    );

    res.status(201).json({
      message: 'Report published successfully.',
      report
    });
  } catch (err: any) {
    console.error('createReport error:', err);
    res.status(500).json({ error: 'Failed to create report.' });
  }
}
