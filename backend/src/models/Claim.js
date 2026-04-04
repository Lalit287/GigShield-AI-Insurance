import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      unique: true,
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Claim amount required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'],
      default: 'pending',
    },
    triggerType: {
      type: String,
      enum: ['rainfall', 'aqi', 'temperature', 'manual'],
      required: true,
    },
    triggerValue: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    weatherData: {
      rainfall: Number,
      aqi: Number,
      temperature: Number,
      humidity: Number,
      timestamp: Date,
    },
    fraudScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    fraudFlags: [String], // ['no_activity', 'duplicate_claim', 'gps_anomaly']
    gpsData: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      timestamp: Date,
    },
    paymentId: String, // Razorpay transaction ID
    processedAt: Date,
    rejectionReason: String,
    notes: String,
  },
  { timestamps: true }
);

// Auto-generate claim number
claimSchema.pre('save', async function (next) {
  if (!this.claimNumber) {
    this.claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Calculate claim age in hours
claimSchema.methods.getAgeInHours = function () {
  return (Date.now() - this.createdAt) / (1000 * 60 * 60);
};

// Add indexes for optimized querying
claimSchema.index({ userId: 1, status: 1 });
claimSchema.index({ status: 1 });

export default mongoose.model('Claim', claimSchema);
