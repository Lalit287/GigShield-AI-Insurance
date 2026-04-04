import mongoose from 'mongoose';

const riskDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    components: {
      weatherRisk: {
        type: Number,
        min: 0,
        max: 100,
      },
      aqiRisk: {
        type: Number,
        min: 0,
        max: 100,
      },
      locationRisk: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    weatherData: {
      rainfall: Number,
      aqi: Number,
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
      pressure: Number,
    },
    historicalData: {
      claimsLast30Days: Number,
      claimsLast90Days: Number,
      avgClaimAmount: Number,
      claimFrequency: String, // 'low', 'medium', 'high'
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'worsening'],
      default: 'stable',
    },
    alerts: [
      {
        type: String,
        enum: ['high_rainfall', 'poor_aqi', 'extreme_temp', 'flood_warning', 'heatwave'],
      },
    ],
    dataSource: {
      type: String,
      enum: ['openweather', 'simulation', 'user_report'],
      default: 'openweather',
    },
  },
  { timestamps: true }
);

// Index for efficient queries
riskDataSchema.index({ userId: 1, createdAt: -1 });
riskDataSchema.index({ zone: 1, createdAt: -1 });

export default mongoose.model('RiskData', riskDataSchema);
