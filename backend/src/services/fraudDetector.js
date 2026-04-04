import Claim from '../models/Claim.js';

/**
 * Fraud Detection Service
 * Identifies suspicious claims using multiple indicators
 */
class FraudDetector {
  /**
   * Comprehensive fraud detection
   * Returns fraud score (0-100) and list of fraud flags
   */
  static async detectFraud(userId, claimData) {
    let fraudScore = 0;
    const fraudFlags = [];

    // Check 1: No Activity Anomaly
    const noActivityCheck = await this.checkNoActivity(userId);
    if (noActivityCheck.isSuspicious) {
      fraudScore += 25;
      fraudFlags.push('no_activity');
    }

    // Check 2: Duplicate Claims
    const duplicateCheck = await this.checkDuplicateClaims(userId, claimData.zone);
    if (duplicateCheck.isSuspicious) {
      fraudScore += 30;
      fraudFlags.push('duplicate_claim');
    }

    // Check 3: GPS Anomaly
    const gpsCheck = await this.checkGPSAnomaly(userId, claimData.gpsData);
    if (gpsCheck.isSuspicious) {
      fraudScore += 20;
      fraudFlags.push('gps_anomaly');
    }

    // Check 4: Weather Mismatch
    const weatherCheck = this.checkWeatherMismatch(claimData);
    if (weatherCheck.isSuspicious) {
      fraudScore += 20;
      fraudFlags.push('weather_mismatch');
    }

    // Check 5: Claim Pattern Analysis
    const patternCheck = await this.checkClaimPattern(userId);
    if (patternCheck.isSuspicious) {
      fraudScore += 15;
      fraudFlags.push('unusual_pattern');
    }

    return {
      fraudScore: Math.min(fraudScore, 100),
      fraudFlags,
      risk: this.getFraudRisk(fraudScore),
      details: {
        noActivity: noActivityCheck,
        duplicateClaims: duplicateCheck,
        gpsAnomaly: gpsCheck,
        weatherMismatch: weatherCheck,
        claimPattern: patternCheck,
      },
    };
  }

  /**
   * Check if user has no activity in required time window
   * Insurance claim requires activity within specified hours
   */
  static async checkNoActivity(userId) {
    try {
      const noActivityHours = parseInt(process.env.FRAUD_NO_ACTIVITY_HOURS) || 4;
      const timeThreshold = new Date(Date.now() - noActivityHours * 60 * 60 * 1000);

      // In production, this would check GPS location logs table
      // For now, we check recent claims
      const recentActivity = await Claim.findOne({
        userId,
        createdAt: { $gte: timeThreshold },
      });

      // If claiming but no recent activity, it's suspicious
      if (!recentActivity) {
        return {
          isSuspicious: true,
          message: `No activity recorded in last ${noActivityHours} hours`,
          severity: 'high',
        };
      }

      return { isSuspicious: false };
    } catch (error) {
      console.error('Error in no activity check:', error);
      return { isSuspicious: false, error: error.message };
    }
  }

  /**
   * Check if user has submitted duplicate claims recently
   */
  static async checkDuplicateClaims(userId, zone) {
    try {
      const duplicateHours = parseInt(process.env.FRAUD_DUPLICATE_CLAIM_HOURS) || 24;
      const timeThreshold = new Date(Date.now() - duplicateHours * 60 * 60 * 1000);

      const recentClaims = await Claim.countDocuments({
        userId,
        zone,
        createdAt: { $gte: timeThreshold },
      });

      if (recentClaims >= 3) {
        return {
          isSuspicious: true,
          message: `${recentClaims} claims in last ${duplicateHours} hours`,
          count: recentClaims,
          severity: 'critical',
        };
      }

      return { isSuspicious: false, count: recentClaims };
    } catch (error) {
      console.error('Error in duplicate claims check:', error);
      return { isSuspicious: false, error: error.message };
    }
  }

  /**
   * Check for GPS spoofing patterns
   * Detects teleportation (impossible movement speeds)
   */
  static async checkGPSAnomaly(userId, currentGps) {
    if (!currentGps || !currentGps.latitude || !currentGps.longitude) {
      return { isSuspicious: false, message: 'No GPS data provided' };
    }

    // Check accuracy (if accuracy > 500m, it's suspicious for a modern smartphone)
    if (currentGps.accuracy > 500) {
      return {
        isSuspicious: true,
        message: 'GPS accuracy too low (possible spoofing or signal jamming)',
        accuracy: currentGps.accuracy,
        severity: 'medium',
      };
    }

    // NEW: Teleportation Check (Distance over time)
    try {
      const lastClaim = await Claim.findOne({ userId }).sort({ createdAt: -1 });
      if (lastClaim && lastClaim.gpsData && lastClaim.gpsData.latitude) {
        const timeDiff = (Date.now() - lastClaim.createdAt) / (1000 * 60 * 60); // hours
        const distance = this.calculateDistance(
          lastClaim.gpsData.latitude,
          lastClaim.gpsData.longitude,
          currentGps.latitude,
          currentGps.longitude
        );

        const speed = distance / timeDiff; // km/h
        if (speed > 120 && timeDiff < 1) { // Impossible speed for a gig worker in traffic
          return {
            isSuspicious: true,
            message: `Impossible speed: ${speed.toFixed(1)} km/h. Distance: ${distance.toFixed(1)} km in ${timeDiff.toFixed(2)} hours.`,
            severity: 'critical'
          };
        }
      }
    } catch (error) {
      console.error('Error in GPS anomaly check:', error);
    }

    return { isSuspicious: false };
  }

  /**
   * Helper: Haversine distance formula
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Check if weather data matches the claim trigger
   */
  static checkWeatherMismatch(claimData) {
    const { triggerType, triggerValue, weatherData } = claimData;

    if (triggerType === 'rainfall' && weatherData.rainfall) {
      // If claiming rainfall but actual rainfall is much lower
      if (weatherData.rainfall < triggerValue * 0.5) {
        return {
          isSuspicious: true,
          message: `Claimed rainfall (${triggerValue}mm) but actual is ${weatherData.rainfall}mm`,
          severity: 'high',
        };
      }
    }

    if (triggerType === 'aqi' && weatherData.aqi) {
      if (weatherData.aqi < triggerValue * 0.5) {
        return {
          isSuspicious: true,
          message: `AQI mismatch: claimed ${triggerValue} but actual is ${weatherData.aqi}`,
          severity: 'medium',
        };
      }
    }

    return { isSuspicious: false };
  }

  /**
   * Analyze user's claim pattern over time
   * Look for unusual spikes or patterns
   */
  static async checkClaimPattern(userId) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const claims = await Claim.find({
        userId,
        createdAt: { $gte: thirtyDaysAgo },
      }).sort({ createdAt: -1 });

      if (claims.length === 0) {
        return { isSuspicious: false, message: 'No claim history' };
      }

      // Calculate average time between claims
      let totalTime = 0;
      for (let i = 0; i < claims.length - 1; i++) {
        totalTime += claims[i].createdAt - claims[i + 1].createdAt;
      }
      const avgTimeBetweenClaims = totalTime / (claims.length - 1);
      const avgHours = avgTimeBetweenClaims / (1000 * 60 * 60);

      //If average time between claims is < 6 hours, it's unusual
      if (avgHours < 6 && claims.length > 2) {
        return {
          isSuspicious: true,
          message: `Unusual claim frequency: average ${avgHours.toFixed(1)} hours between claims`,
          avgHours: avgHours.toFixed(1),
          severity: 'medium',
        };
      }

      return { isSuspicious: false, avgHours: avgHours.toFixed(1) };
    } catch (error) {
      console.error('Error in claim pattern check:', error);
      return { isSuspicious: false, error: error.message };
    }
  }

  /**
   * Get fraud risk level
   */
  static getFraudRisk(score) {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }
}

export default FraudDetector;
