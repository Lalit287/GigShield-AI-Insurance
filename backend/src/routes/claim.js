import express from 'express';
import ClaimController from '../controllers/claimController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Claim Routes
 */

// Create claims
router.post('/auto', authMiddleware, ClaimController.autoProcessClaim);
router.post('/manual', authMiddleware, ClaimController.createManualClaim);

// Get claims
router.get('/user/:userId?', authMiddleware, ClaimController.getUserClaims);
router.get('/:claimId', authMiddleware, ClaimController.getClaimDetails);

// Admin routes
router.put('/:claimId/approve', authMiddleware, authorize('admin'), ClaimController.approveClaim);
router.put('/:claimId/reject', authMiddleware, authorize('admin'), ClaimController.rejectClaim);
router.get('/stats', authMiddleware, authorize('admin'), ClaimController.getClaimStats);

export default router;
