import { Router } from 'express';
import { getAdminStats, adminUpdateReportStatus, getAdminUsers, adminLogin } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();

// Dedicated Admin Authentication endpoint
adminRouter.post('/login', adminLogin);

// Protected Admin Operations
adminRouter.get('/stats', authenticateToken, requireRole(['admin', 'security_staff']), getAdminStats);
adminRouter.get('/users', authenticateToken, requireRole(['admin', 'security_staff']), getAdminUsers);
adminRouter.patch('/reports/:reportId/status', authenticateToken, requireRole(['admin', 'security_staff']), adminUpdateReportStatus);

