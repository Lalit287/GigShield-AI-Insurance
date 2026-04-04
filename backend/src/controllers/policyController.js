import Policy from '../models/Policy.js';
import User from '../models/User.js';
import AIService from '../services/aiService.js';
import WeatherService from '../services/weatherService.js';

/**
 * Policy Controller
 * Handles policy creation, retrieval, and management
 */
class PolicyController {
  /**
   * POST /policy/create
   * Create a new insurance policy
   */
  static async createPolicy(req, res, next) {
    try {
      const { level, zone } = req.body;
      const userId = req.userId;

      // Ensure start and end dates are handled (mocking 4 weeks default for hackathon)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 28); // 4 weeks

      // Try fetching weather, but default if fail
      let currentWeatherData = {};
      try {
        currentWeatherData = await WeatherService.getWeatherByZone(zone);
      } catch (e) {
        console.warn('Weather fetch failed, using default');
      }

      // 1. AI Integration: Dynamic Pricing Engine
      const aiResponse = await AIService.calculatePremium(
        zone || 'Hyderabad Central',
        level,
        4, // weeks
        currentWeatherData
      );

      const premium = aiResponse.premium.adjusted_premium_weekly;
      const coverageAmount = aiResponse.premium.coverage_amount;
      const riskScore = aiResponse.risk_score;
      const riskLevel = aiResponse.risk_level;

      let aiNote = `AI Insight: Premium dynamically generated using 5-factor weather predictors. Local risk score: ${riskScore} (${riskLevel})`;
      if (aiResponse.premium.risk_multiplier < 1) {
        aiNote += ` | You received a safe-zone discount!`;
      }

      const policy = new Policy({
        userId,
        level,
        premium,
        coverage: coverageAmount,
        zone: zone || 'Hyderabad Central',
        startDate,
        endDate,
        paymentStatus: 'completed', // In production, integrate with payment gateway
      });

      await policy.save();

      // Update user risk level based on ai engine
      const user = await User.findById(userId);
      user.riskLevel = riskLevel;
      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Policy created successfully',
        data: {
          policy,
          aiNote,
          message: 'Your policy is now active!',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /policy/:userId
   * Get all policies for a user
   */
  static async getUserPolicies(req, res, next) {
    try {
      const userId = req.params.userId || req.userId;

      const policies = await Policy.find({ userId }).sort({ createdAt: -1 });

      if (!policies.length) {
        return res.status(200).json({
          success: true,
          message: 'No policies found',
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: `Found ${policies.length} policy(ies)`,
        data: policies,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /policy/active/:userId
   * Get active policy for a user
   */
  static async getActivePolicy(req, res, next) {
    try {
      const userId = req.params.userId || req.userId;

      const policy = await Policy.findOne({
        userId,
        status: 'active',
      });

      if (!policy) {
        return res.status(200).json({
          success: true,
          message: 'No active policy found',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        data: policy,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /policy/:policyId/cancel
   * Cancel an active policy
   */
  static async cancelPolicy(req, res, next) {
    try {
      const { policyId } = req.params;

      const policy = await Policy.findByIdAndUpdate(
        policyId,
        { status: 'cancelled' },
        { new: true }
      );

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Policy cancelled successfully',
        data: policy,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /policy/stats
   * Admin endpoint: Get policy statistics
   */
  static async getPolicyStats(req, res, next) {
    try {
      const stats = await Policy.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalPremium: { $sum: '$premium' },
            totalCoverage: { $sum: '$coverage' },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper: Calculate user risk level based on zone
   */
  static calculateUserRiskLevel(zone) {
    const riskByZone = {
      'Hyderabad Central': 'high',
      'Secunderabad': 'high',
      'Begumpet': 'medium',
      'Bannerghatta': 'low',
      'Whitefield': 'low',
    };

    return riskByZone[zone] || 'medium';
  }
}

export default PolicyController;
