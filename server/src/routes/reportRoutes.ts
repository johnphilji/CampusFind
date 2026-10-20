import { Router } from 'express';
import { getReports, getReportById, createReport } from '../controllers/reportController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

export const reportRouter = Router();

reportRouter.get('/', optionalAuth, getReports);
reportRouter.get('/:id', optionalAuth, getReportById);
reportRouter.post('/', authenticateToken, createReport);
