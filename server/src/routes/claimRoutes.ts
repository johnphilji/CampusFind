import { Router } from 'express';
import { submitClaim, getClaims, reviewClaim, reopenReport } from '../controllers/claimController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const claimRouter = Router();

claimRouter.get('/', authenticateToken, getClaims);
claimRouter.post('/', authenticateToken, submitClaim);
claimRouter.patch('/:claimId/review', authenticateToken, reviewClaim);
claimRouter.post('/report/:reportId/reopen', authenticateToken, requireRole(['admin', 'security_staff']), reopenReport);
