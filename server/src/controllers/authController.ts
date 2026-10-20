import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';
import { config } from '../config/index.js';
import { RequestWithUser } from '../middleware/auth.js';

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, fullName, studentId, department, role } = req.body;

  if (!email || !password || !fullName || !studentId) {
    res.status(400).json({ error: 'Missing required registration fields.' });
    return;
  }

  // Enforce college domain email convention
  if (!email.includes('@')) {
    res.status(400).json({ error: 'Valid college email is required.' });
    return;
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR student_id = $2', [email, studentId]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'A student account with this email or student ID already exists.' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Explicit default: registrations cannot self-assign 'admin' unless verified
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    const insertRes = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, student_id, department, role, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, full_name, student_id, department, role, avatar_url`,
      [
        email.toLowerCase().trim(),
        passwordHash,
        fullName.trim(),
        studentId.trim(),
        department || 'General Campus',
        assignedRole,
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`
      ]
    );

    const user = insertRes.rows[0];

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

    res.status(201).json({
      message: 'Account created successfully.',
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
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error while registering user.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const userRes = await pool.query(
      `SELECT id, email, password_hash, full_name, student_id, department, role, avatar_url
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Invalid college email or password.' });
      return;
    }

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      res.status(401).json({ error: 'Invalid college email or password.' });
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

    res.json({
      message: 'Authentication successful.',
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
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  }
}

export async function getProfile(req: RequestWithUser, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    const userRes = await pool.query(
      `SELECT id, email, full_name, student_id, department, role, avatar_url, phone_number, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    res.json({ user: userRes.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}
