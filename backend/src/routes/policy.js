import express from 'express';
import PolicyController from '../controllers/policyController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Policy Routes
 */

// Create policy
router.post('/create', authMiddleware, PolicyController.createPolicy);

// Get policies
router.get('/:userId?', authMiddleware, PolicyController.getUserPolicies);
router.get('/active/:userId?', authMiddleware, PolicyController.getActivePolicy);

// Cancel policy
router.put('/:policyId/cancel', authMiddleware, PolicyController.cancelPolicy);

// Admin routes
router.get('/stats', authMiddleware, authorize('admin'), PolicyController.getPolicyStats);

export default router;
