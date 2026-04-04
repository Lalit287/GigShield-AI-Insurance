import Claim from '../models/Claim.js';
import Policy from '../models/Policy.js';
import User from '../models/User.js';
import FraudDetector from '../services/fraudDetector.js';
import FinancialService from '../services/financialService.js';
import NotificationService from '../services/notificationService.js';
import RiskCalculator from '../services/riskCalculator.js';
import WeatherService from '../services/weatherService.js';
import AIService from '../services/aiService.js';

/**
 * Claim Controller
 * Handles claim creation, verification, and processing
 */
class ClaimController {
  /**
   * POST /claim/auto
   * Auto-process claim based on trigger conditions
   */
  static async autoProcessClaim(req, res, next) {
    try {
      const userId = req.userId;
      const { zone, triggerType, triggerValue, gpsData } = req.body;

      // Validate input
      if (!zone || !triggerType) {
        return res.status(400).json({
          success: false,
          message: 'Zone and triggerType are required',
        });
      }

      // Get active policy
      const policy = await Policy.findOne({
        userId,
        status: 'active',
        zone,
      });

      if (!policy || policy.isExpired()) {
        return res.status(400).json({
          success: false,
          message: 'No active policy found for this zone',
        });
      }

      // Get current weather data
      const weatherData = await WeatherService.getWeatherByZone(zone);

      // Verify trigger condition
      const threshold = policy.triggers[triggerType];
      if (triggerValue < threshold) {
        return res.status(400).json({
          success: false,
          message: `Trigger value (${triggerValue}) below threshold (${threshold})`,
        });
      }

      const claimId = `CLM-${Date.now()}`;
      
      // Perform fraud detection and dynamic claim decision via AI Bridge
      const claimPayload = {
        userId,
        claimId,
        amount: policy.coverage,
        triggerType,
        triggerValue,
        gpsData,
      };

      const aiDecision = await AIService.evaluateClaim(claimPayload, weatherData);

      // Create claim record
      const claim = new Claim({
        userId,
        policyId: policy._id,
        amount: policy.coverage,
        status: 'pending',
        triggerType,
        triggerValue,
        threshold,
        zone,
        weatherData,
        gpsData,
        fraudScore: aiDecision.fraud_score,
        fraudFlags: aiDecision.fraud_indicators || [],
      });

      await claim.save();

      // Implement decision from AI engine
      if (aiDecision.status === 'AUTO_APPROVED') {
        claim.status = 'approved';
        claim.processedAt = new Date();
        
        // ✨ NEW: Financial & Notification Bridge (Hackathon Phase 3)
        const user = await User.findById(userId);
        if (user) {
          // Process Payout
          const payout = await FinancialService.processPayout(userId, claim.amount, claim._id);
          if (payout.success) {
            claim.status = 'paid';
            claim.paymentId = payout.transactionId;
          }

          // Send Multi-channel Notification
          await NotificationService.sendPayoutNotification(user, claim);
        }
        
        await claim.save();
      }

      return res.status(201).json({
        success: true,
        message: 'Claim created successfully',
        data: {
          claim,
          aiDecision,
          autoApproved: claim.status === 'approved' || claim.status === 'paid',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /claim/manual
   * Manually create a claim
   */
  static async createManualClaim(req, res, next) {
    try {
      const userId = req.userId;
      const { zone, amount, description } = req.body;

      // Get active policy
      const policy = await Policy.findOne({
        userId,
        status: 'active',
        zone,
      });

      if (!policy || policy.isExpired()) {
        return res.status(400).json({
          success: false,
          message: 'No active policy found',
        });
      }

      const claim = new Claim({
        userId,
        policyId: policy._id,
        amount: amount || policy.coverage,
        status: 'pending',
        triggerType: 'manual',
        zone,
        notes: description,
      });

      await claim.save();

      return res.status(201).json({
        success: true,
        message: 'Manual claim submitted for review',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /claim/:claimId
   * Get claim details
   */
  static async getClaimDetails(req, res, next) {
    try {
      const { claimId } = req.params;

      const claim = await Claim.findById(claimId)
        .populate('userId', 'name email phone')
        .populate('policyId', 'level premium coverage');

      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Claim not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /claim/user/:userId
   * Get all claims for a user
   */
  static async getUserClaims(req, res, next) {
    try {
      const userId = req.params.userId || req.userId;
      const status = req.query.status;

      const filter = { userId };
      if (status) filter.status = status;

      const claims = await Claim.find(filter)
        .sort({ createdAt: -1 })
        .populate('policyId', 'level premium');

      return res.status(200).json({
        success: true,
        message: `Found ${claims.length} claim(s)`,
        data: claims,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /claim/:claimId/approve
   * Admin: Approve a claim
   */
  static async approveClaim(req, res, next) {
    try {
      const { claimId } = req.params;

      const claim = await Claim.findByIdAndUpdate(
        claimId,
        {
          status: 'approved',
          processedAt: new Date(),
        },
        { new: true }
      );

      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Claim not found',
        });
      }

      // ✨ NEW: Financial & Notification Bridge for Manual Approval (Phase 3)
      const user = await User.findById(claim.userId);
      if (user) {
        const payout = await FinancialService.processPayout(user._id, claim.amount, claim._id);
        if (payout.success) {
          claim.status = 'paid';
          claim.paymentId = payout.transactionId;
          await claim.save();
        }
        await NotificationService.sendPayoutNotification(user, claim);
      }

      return res.status(200).json({
        success: true,
        message: 'Claim approved and payout processed',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /claim/:claimId/reject
   * Admin: Reject a claim
   */
  static async rejectClaim(req, res, next) {
    try {
      const { claimId } = req.params;
      const { reason } = req.body;

      const claim = await Claim.findByIdAndUpdate(
        claimId,
        {
          status: 'rejected',
          rejectionReason: reason,
          processedAt: new Date(),
        },
        { new: true }
      );

      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Claim not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Claim rejected',
        data: claim,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /claim/stats
   * Admin: Get claim statistics
   */
  static async getClaimStats(req, res, next) {
    try {
      const [stats, fraudStats] = await Promise.all([
        Claim.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' },
            },
          },
        ]),
        Claim.aggregate([
          {
            $group: {
              _id: null,
              avgFraudScore: { $avg: '$fraudScore' },
              flaggedCount: { $sum: { $cond: [{ $gt: ['$fraudScore', 50] }, 1, 0] } },
              totalClaims: { $sum: 1 },
            },
          },
        ])
      ]);

      return res.status(200).json({
        success: true,
        data: {
          byStatus: stats,
          fraudAnalysis: fraudStats[0],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ClaimController;
