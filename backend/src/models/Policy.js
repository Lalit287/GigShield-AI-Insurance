import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    policyNumber: {
      type: String,
      unique: true,
      required: false,
    },
    level: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      required: true,
    },
    premium: {
      type: Number,
      required: [true, 'Please provide premium amount'],
      min: 0,
    },
    coverage: {
      type: Number, // Coverage amount in ₹
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    triggers: {
      rainfall: {
        type: Number,
        default: 50, // mm
      },
      aqi: {
        type: Number,
        default: 300,
      },
      temperature: {
        type: Number,
        default: 42, // Celsius
      },
      humidity: {
        type: Number,
        default: 85, // percentage
      },
      windSpeed: {
        type: Number,
        default: 40, // km/h
      },
    },
    zone: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentId: String, // Razorpay or similar
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate policy number
policySchema.pre('save', async function (next) {
  if (!this.policyNumber) {
    this.policyNumber = `GS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Check if policy is expired
policySchema.methods.isExpired = function () {
  return new Date() > this.endDate;
};

// Add indexes for optimized querying
policySchema.index({ userId: 1, status: 1, zone: 1 });
policySchema.index({ userId: 1 });

export default mongoose.model('Policy', policySchema);
