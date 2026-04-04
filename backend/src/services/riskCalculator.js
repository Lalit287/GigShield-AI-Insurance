import RiskData from '../models/RiskData.js';

/**
 * Risk Calculator Service
 * Calculates overall risk score based on multiple factors
 */
class RiskCalculator {
  /**
   * Calculate comprehensive risk score
   * Risk = (Weather × 0.4) + (AQI × 0.3) + (Location × 0.3)
   */
  static calculateRiskScore(weatherData, locationFactor = 50) {
    const weatherRisk = this.calculateWeatherRisk(weatherData);
    const aqiRisk = this.calculateAQIRisk(weatherData.aqi || 0);
    const locationRisk = locationFactor;

    const WEATHER_WEIGHT = parseFloat(process.env.RISK_WEATHER_WEIGHT) || 0.4;
    const AQI_WEIGHT = parseFloat(process.env.RISK_AQI_WEIGHT) || 0.3;
    const LOCATION_WEIGHT = parseFloat(process.env.RISK_LOCATION_WEIGHT) || 0.3;

    const totalRisk =
      weatherRisk * WEATHER_WEIGHT +
      aqiRisk * AQI_WEIGHT +
      locationRisk * LOCATION_WEIGHT;

    return {
      totalScore: Math.round(totalRisk),
      components: {
        weatherRisk,
        aqiRisk,
        locationRisk,
      },
      level: this.getRiskLevel(totalRisk),
    };
  }

  /**
   * Calculate weather-based risk (rainfall, temperature, humidity, wind)
   * Enhanced with AI-driven anomaly detection factors
   */
  static calculateWeatherRisk(weatherData) {
    let weatherScore = 0;

    // 1. Rainfall risk (Primary Factor)
    const rainfallThreshold = parseFloat(process.env.RAINFALL_THRESHOLD_MM) || 50;
    const rainfall = weatherData.rainfall || 0;
    const rainfallRisk = Math.min((rainfall / rainfallThreshold) * 100, 100);

    // 2. Temperature risk (Heatwave potential)
    const tempThreshold = parseFloat(process.env.TEMP_THRESHOLD_C) || 42;
    const temperature = weatherData.temperature || 25;
    const tempRisk = Math.max(((temperature - 25) / (tempThreshold - 25)) * 100, 0);

    // 3. Humidity risk (Disruption baseline)
    const humidityThreshold = parseFloat(process.env.HUMIDITY_THRESHOLD) || 85;
    const humidity = weatherData.humidity || 50;
    const humidityRisk = Math.min((humidity / humidityThreshold) * 100, 100);

    // 4. Wind Speed risk (Structural/Navigational disruption)
    const windThreshold = parseFloat(process.env.WIND_SPEED_THRESHOLD) || 45;
    const windSpeed = weatherData.windSpeed || 10;
    const windRisk = Math.min((windSpeed / windThreshold) * 100, 100);

    // AI Predictive Anomaly Factor (Simulated)
    // In a real system, this would compare current metrics against a 10-year historical baseline
    const anomalyFactor = (rainfall > 30 && windSpeed > 25) ? 1.2 : 1.0;

    // Advanced Weighted weather score (Rain-heavy model for monsoon regions)
    weatherScore = (
      (rainfallRisk * 0.5) +   // Rainfall is the biggest disruption for gig workers
      (windRisk * 0.2) +       // Wind affects delivery safety
      (tempRisk * 0.15) +      // Heat affects efficiency
      (humidityRisk * 0.15)    // Humidity affects overall comfort/AQI baseline
    ) * anomalyFactor;

    return Math.min(weatherScore, 100);
  }

  /**
   * Calculate AQI-based risk
   */
  static calculateAQIRisk(aqi) {
    // AQI Scale: 0-50 (Good), 51-100 (Moderate), 101-150 (Poor), etc.
    const aqiThreshold = parseFloat(process.env.AQI_THRESHOLD) || 300;
    const aqiRisk = Math.min((aqi / aqiThreshold) * 100, 100);
    return aqiRisk;
  }

  /**
   * Get risk level description
   */
  static getRiskLevel(score) {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }

  /**
   * Save risk calculation to database
   */
  static async saveRiskData(userId, zone, weatherData, riskScore) {
    try {
      const riskData = new RiskData({
        userId,
        zone,
        riskScore: riskScore.totalScore,
        components: riskScore.components,
        weatherData,
        riskLevel: riskScore.level,
        dataSource: 'openweather',
      });

      await riskData.save();
      return riskData;
    } catch (error) {
      console.error('Error saving risk data:', error);
      throw error;
    }
  }

  /**
   * Get user's risk history
   */
  static async getUserRiskHistory(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await RiskData.find({
        userId,
        createdAt: { $gte: startDate },
      }).sort({ createdAt: -1 });

      return history;
    } catch (error) {
      console.error('Error fetching risk history:', error);
      throw error;
    }
  }

  /**
   * Get zone-wide risk assessment
   */
  static async getZoneRiskAssessment(zone) {
    try {
      const latestRiskDataByZone = await RiskData.aggregate([
        { $match: { zone } },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
        {
          $group: {
            _id: null,
            avgRiskScore: { $avg: '$riskScore' },
            maxRiskScore: { $max: '$riskScore' },
            minRiskScore: { $min: '$riskScore' },
            count: { $sum: 1 },
          },
        },
      ]);

      return latestRiskDataByZone[0] || null;
    } catch (error) {
      console.error('Error calculating zone risk:', error);
      throw error;
    }
  }
}

export default RiskCalculator;
