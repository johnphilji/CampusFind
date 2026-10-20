import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticatedUser, UserRole } from '../types/index.js';

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

export function authenticateToken(req: RequestWithUser, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required. Please sign in.' });
    return;
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: 'Invalid or expired token.' });
      return;
    }
    req.user = decoded as AuthenticatedUser;
    next();
  });
}

// Optional Auth (for public listings where we also know if someone is signed in)
export function optionalAuth(req: RequestWithUser, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded as AuthenticatedUser;
    }
    next();
  });
}

// Role-Based Authorization Guard
export function requireRole(allowedRoles: UserRole[]) {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient privileges for administrative operation.'
      });
      return;
    }

    next();
  };
}
