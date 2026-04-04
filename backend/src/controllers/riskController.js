import RiskCalculator from '../services/riskCalculator.js';
import WeatherService from '../services/weatherService.js';
import RiskData from '../models/RiskData.js';

/**
 * Risk Controller
 * Calculates risk scores and manages risk data
 */
class RiskController {
  /**
   * POST /risk/calculate
   * Calculate risk score for a user/zone
   */
  static async calculateRisk(req, res, next) {
    try {
      const { zone } = req.body;
      const userId = req.userId;

      if (!zone) {
        return res.status(400).json({
          success: false,
          message: 'Zone is required',
        });
      }

      // Fetch current weather
      const weatherData = await WeatherService.getWeatherByZone(zone);

      // Calculate risk score
      const riskScore = RiskCalculator.calculateRiskScore(weatherData);

      // Save to database
      const riskRecord = await RiskCalculator.saveRiskData(
        userId,
        zone,
        weatherData,
        riskScore
      );

      return res.status(200).json({
        success: true,
        message: 'Risk calculated successfully',
        data: {
          riskScore,
          weatherData,
          riskRecord,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /risk/score/:zone
   * Get current risk score for a zone
   */
  static async getZoneRiskScore(req, res, next) {
    try {
      const { zone } = req.params;

      const weatherData = await WeatherService.getWeatherByZone(zone);
      const riskScore = RiskCalculator.calculateRiskScore(weatherData);

      return res.status(200).json({
        success: true,
        data: {
          zone,
          riskScore,
          weatherData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /risk/history/:userId
   * Get risk history for a user
   */
  static async getUserRiskHistory(req, res, next) {
    try {
      const { userId } = req.params;
      const days = parseInt(req.query.days) || 30;

      const history = await RiskCalculator.getUserRiskHistory(userId, days);

      return res.status(200).json({
        success: true,
        message: `Retrieved ${history.length} risk records`,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /risk/zone/:zone
   * Get zone-wide risk assessment
   */
  static async getZoneRiskAssessment(req, res, next) {
    try {
      const { zone } = req.params;

      const assessment = await RiskCalculator.getZoneRiskAssessment(zone);
      const weatherAlerts = await WeatherService.getWeatherAlerts(zone);

      return res.status(200).json({
        success: true,
        data: {
          zone,
          assessment,
          weatherAlerts,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /risk/alerts/:zone
   * Get active weather alerts for a zone
   */
  static async getWeatherAlerts(req, res, next) {
    try {
      const { zone } = req.params;

      const alerts = await WeatherService.getWeatherAlerts(zone);

      return res.status(200).json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /risk/check-triggers
   * [Zero-Touch Automation] Check if any triggers are met and AUTO-CREATE claims
   */
  static async checkTriggers(req, res, next) {
    try {
      const { zone } = req.body;
      if (!zone) {
        return res.status(400).json({ success: false, message: 'Zone is required' });
      }

      const weatherData = await WeatherService.getWeatherByZone(zone);
      const triggers = this.evaluateTriggers(weatherData);

      let autoClaimsCreated = 0;

      // HACKATHON FEATURE: Zero-Touch Automation
      // If triggers are met, automatically create claims for all active policies in this zone
      if (triggers.triggered) {
        const Policy = (await import('../models/Policy.js')).default;
        const Claim = (await import('../models/Claim.js')).default;

        const activePolicies = await Policy.find({
          zone,
          status: 'active',
        });

        for (const policy of activePolicies) {
          // Check if this specific policy's thresholds were triggered
          const triggeredByType = triggers.triggers.find(t => 
            weatherData[t.type] >= policy.triggers[t.type]
          );

          if (triggeredByType) {
            // Check if a claim for this trigger/policy already exists today to avoid duplicates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const existingClaim = await Claim.findOne({
              policyId: policy._id,
              triggerType: triggeredByType.type,
              createdAt: { $gte: today }
            });

            if (!existingClaim) {
              const newClaim = new Claim({
                userId: policy.userId,
                policyId: policy._id,
                amount: policy.coverage,
                status: 'approved', // Auto-approved in Zero-Touch
                triggerType: triggeredByType.type,
                triggerValue: weatherData[triggeredByType.type],
                threshold: policy.triggers[triggeredByType.type],
                zone: policy.zone,
                weatherData,
                processedAt: new Date(),
                notes: '🤖 AI Zero-Touch: Automatically triggered and approved based on real-time weather data.'
              });
              await newClaim.save();
              autoClaimsCreated++;
            }
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: triggers.triggered 
          ? `Trigger detected! Zero-Touch: ${autoClaimsCreated} claims auto-processed.` 
          : 'No trigger condition met',
        data: {
          zone,
          weatherData,
          triggers,
          autoClaimsCreated
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper: Evaluate if any triggers are activated
   */
  static evaluateTriggers(weatherData) {
    const RAINFALL_THRESHOLD = parseFloat(process.env.RAINFALL_THRESHOLD_MM) || 50;
    const AQI_THRESHOLD = parseFloat(process.env.AQI_THRESHOLD) || 300;
    const TEMP_THRESHOLD = parseFloat(process.env.TEMP_THRESHOLD_C) || 42;
    const HUMIDITY_THRESHOLD = 85;
    const WIND_THRESHOLD = 40;

    const triggeredList = [];

    if (weatherData.rainfall >= RAINFALL_THRESHOLD) {
      triggeredList.push({
        type: 'rainfall',
        value: weatherData.rainfall,
        threshold: RAINFALL_THRESHOLD,
        triggered: true,
      });
    }

    if (weatherData.aqi >= AQI_THRESHOLD) {
      triggeredList.push({
        type: 'aqi',
        value: weatherData.aqi,
        threshold: AQI_THRESHOLD,
        triggered: true,
      });
    }

    if (weatherData.temperature >= TEMP_THRESHOLD) {
      triggeredList.push({
        type: 'temperature',
        value: weatherData.temperature,
        threshold: TEMP_THRESHOLD,
        triggered: true,
      });
    }

    if (weatherData.humidity >= HUMIDITY_THRESHOLD) {
      triggeredList.push({
        type: 'humidity',
        value: weatherData.humidity,
        threshold: HUMIDITY_THRESHOLD,
        triggered: true,
      });
    }

    if (weatherData.windSpeed >= WIND_THRESHOLD) {
      triggeredList.push({
        type: 'windSpeed',
        value: weatherData.windSpeed,
        threshold: WIND_THRESHOLD,
        triggered: true,
      });
    }

    return {
      triggered: triggeredList.length > 0,
      triggers: triggeredList,
    };
  }
}

export default RiskController;
