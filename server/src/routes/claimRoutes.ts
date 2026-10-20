import { Router } from 'express';
import { submitClaim, getClaims, reviewClaim } from '../controllers/claimController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const claimRouter = Router();

claimRouter.get('/', authenticateToken, getClaims);
claimRouter.post('/', authenticateToken, submitClaim);
claimRouter.patch('/:claimId/review', authenticateToken, requireRole(['admin', 'security_staff']), reviewClaim);
