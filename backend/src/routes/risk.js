import express from 'express';
import RiskController from '../controllers/riskController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Risk Routes
 */

// Calculate risk
router.post('/calculate', authMiddleware, RiskController.calculateRisk);

// Get risk scores
router.get('/score/:zone', RiskController.getZoneRiskScore);

// Get risk history
router.get('/history/:userId', authMiddleware, RiskController.getUserRiskHistory);

// Zone assessment
router.get('/zone/:zone', RiskController.getZoneRiskAssessment);

// Weather alerts
router.get('/alerts/:zone', RiskController.getWeatherAlerts);

// Check triggers
router.post('/check-triggers', authMiddleware, RiskController.checkTriggers);

export default router;
