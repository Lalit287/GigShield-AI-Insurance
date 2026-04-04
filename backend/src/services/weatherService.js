import axios from 'axios';

/**
 * Weather Service
 * Fetches real-time weather data and environmental metrics
 * Falls back to simulation for development/testing
 */

const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

class WeatherService {
  /**
   * Get current weather for a zone
   * Zone coordinates are hardcoded for demo zones
   */
  static async getWeatherByZone(zone) {
    // Demo zone coordinates
    const zoneCoordinates = {
      'Hyderabad Central': { lat: 17.3850, lon: 78.4867 },
      'Secunderabad': { lat: 17.3688, lon: 78.4563 },
      'Begumpet': { lat: 17.4062, lon: 78.4559 },
      'Bannerghatta': { lat: 12.8395, lon: 77.6245 },
      'Whitefield': { lat: 12.9698, lon: 77.7499 },
    };

    const coords = zoneCoordinates[zone] || zoneCoordinates['Hyderabad Central'];

    // Check Cache first
    if (weatherCache.has(zone)) {
      const cached = weatherCache.get(zone);
      if (Date.now() - cached.timestamp.getTime() < CACHE_TTL_MS) {
        console.log(`\x1b[36m☁️ [WEATHER CACHE HIT]\x1b[0m Returning cached weather for ${zone}`);
        return cached.data;
      }
    }

    let finalData;

    try {
      // Try real API first
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (apiKey && apiKey !== 'your_openweather_api_key_here') {
        finalData = await this.fetchRealWeather(coords.lat, coords.lon);
      }
    } catch (error) {
      console.warn('Real weather API failed, using simulation:', error.message);
    }

    // Fall back to simulation if finalData is still undefined
    if (!finalData) {
      finalData = this.simulateWeather(zone);
    }

    // Save to Cache
    weatherCache.set(zone, { timestamp: new Date(), data: finalData });
    return finalData;
  }

  /**
   * Fetch real weather data from OpenWeatherMap
   */
  static async fetchRealWeather(lat, lon) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

      const response = await axios.get(
        `${baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp * 10) / 10,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        rainfall: data.rain?.['1h'] || 0,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        timestamp: new Date(),
        aqi: await this.getAQI(lat, lon),
        source: 'openweather',
      };
    } catch (error) {
      console.error('Error fetching real weather:', error.message);
      throw error;
    }
  }

  /**
   * Get Air Quality Index
   */
  static async getAQI(lat, lon) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

      const response = await axios.get(
        `${baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );

      // AQI scale: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
      // Convert to 0-500 scale
      const aqi = response.data.list[0].main.aqi;
      return aqi * 100; // Simple conversion (scale 1-5 to 100-500)
    } catch (error) {
      console.error('Error fetching AQI:', error.message);
      return 100; // Default moderate AQI
    }
  }

  /**
   * Simulate weather data for testing/development
   * Returns realistic but randomized data
   */
  static simulateWeather(zone) {
    // Base values by zone (Hyderabad is typically hot and dry)
    const baseTemps = {
      'Hyderabad Central': 32,
      'Secunderabad': 31,
      'Begumpet': 31,
      'Bannerghatta': 28,
      'Whitefield': 27,
    };

    const baseTemp = baseTemps[zone] || 30;
    const variance = Math.random() * 8 - 4; // -4 to +4

    return {
      temperature: Math.round((baseTemp + variance) * 10) / 10,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      pressure: Math.floor(Math.random() * 20) + 1000, // 1000-1020 hPa
      rainfall: Math.random() > 0.8 ? Math.random() * 100 : 0, // 20% chance of rain
      windSpeed: Math.round(Math.random() * 15 * 10) / 10, // 0-15 km/h
      description: Math.random() > 0.7 ? 'rainy' : 'partly cloudy',
      timestamp: new Date(),
      aqi: Math.floor(Math.random() * 200) + 50, // 50-250 (moderate to poor)
      source: 'simulation',
    };
  }

  /**
   * Get weather alert status for a zone
   */
  static async getWeatherAlerts(zone) {
    const weather = await this.getWeatherByZone(zone);
    const alerts = [];

    const RAINFALL_THRESHOLD = parseFloat(process.env.RAINFALL_THRESHOLD_MM) || 50;
    const AQI_THRESHOLD = parseFloat(process.env.AQI_THRESHOLD) || 300;
    const TEMP_THRESHOLD = parseFloat(process.env.TEMP_THRESHOLD_C) || 42;
    const HUMIDITY_THRESHOLD = parseFloat(process.env.HUMIDITY_THRESHOLD) || 85;
    const WIND_SPEED_THRESHOLD = parseFloat(process.env.WIND_SPEED_THRESHOLD) || 45;

    if (weather.rainfall > RAINFALL_THRESHOLD) {
      alerts.push({
        type: 'high_rainfall',
        message: `Heavy rainfall: ${weather.rainfall}mm (threshold: ${RAINFALL_THRESHOLD}mm)`,
        severity: 'high',
      });
    }

    if (weather.aqi > AQI_THRESHOLD) {
      alerts.push({
        type: 'poor_aqi',
        message: `Poor air quality: AQI ${weather.aqi} (threshold: ${AQI_THRESHOLD})`,
        severity: 'high',
      });
    }

    if (weather.temperature > TEMP_THRESHOLD) {
      alerts.push({
        type: 'extreme_temp',
        message: `Extreme heat: ${weather.temperature}°C (threshold: ${TEMP_THRESHOLD}°C)`,
        severity: 'high',
      });
    }

    if (weather.humidity > HUMIDITY_THRESHOLD) {
      alerts.push({
        type: 'extreme_humidity',
        message: `Extreme humidity: ${weather.humidity}% (threshold: ${HUMIDITY_THRESHOLD}%)`,
        severity: 'medium',
      });
    }

    if (weather.windSpeed > WIND_SPEED_THRESHOLD) {
      alerts.push({
        type: 'high_wind',
        message: `High wind speeds: ${weather.windSpeed}km/h (threshold: ${WIND_SPEED_THRESHOLD}km/h)`,
        severity: 'medium',
      });
    }

    return {
      zone,
      weather,
      alerts,
      hasAlerts: alerts.length > 0,
    };
  }
}

export default WeatherService;
