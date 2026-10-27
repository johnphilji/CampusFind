import { Router } from 'express';
import { getAdminStats, adminUpdateReportStatus, getAdminUsers } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();

// All admin routes require authentication + admin/security_staff role
adminRouter.get('/stats', authenticateToken, requireRole(['admin', 'security_staff']), getAdminStats);
adminRouter.get('/users', authenticateToken, requireRole(['admin', 'security_staff']), getAdminUsers);
adminRouter.patch('/reports/:reportId/status', authenticateToken, requireRole(['admin', 'security_staff']), adminUpdateReportStatus);
