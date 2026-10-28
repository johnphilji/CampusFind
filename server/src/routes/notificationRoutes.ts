import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { pool } from '../db/index.js';

export const notificationRouter = Router();

// GET /api/notifications - Get all notifications for logged-in user
notificationRouter.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, user_id, title, message, type, target_report_id, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    // Map to frontend notification format
    const formatted = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type,
      reportId: row.target_report_id,
      read: row.is_read,
      createdAt: row.created_at,
    }));

    res.json({ notifications: formatted });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
notificationRouter.patch('/:id/read', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
notificationRouter.patch('/read-all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;

  try {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
      [userId]
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error marking all notifications read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});
