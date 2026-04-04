import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Policy from '../models/Policy.js';
import Claim from '../models/Claim.js';
import RiskData from '../models/RiskData.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gigshield';

const seed = async () => {
  try {
    console.log('🔄 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    // Clear existing data
    console.log('🧹 Clearing old data...');
    await User.deleteMany({});
    await Policy.deleteMany({});
    await Claim.deleteMany({});
    await RiskData.deleteMany({});

    // 1. Create Admin
    console.log('👤 Creating Admin...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gigshield.ai',
      password: 'admin123',
      role: 'admin',
      avatar: 'AD'
    });

    // 2. Create Workers in different zones
    console.log('👥 Creating Workers...');
    
    // Rahul in Hyderabad Central (Medium Risk)
    const rahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@demo.com',
      password: 'demo123',
      role: 'worker',
      zone: 'Hyderabad Central',
      riskLevel: 'medium',
      avatar: 'RS',
      kycVerified: true
    });

    // Priya in Whitefield (Safe Zone Discount)
    const priya = await User.create({
      name: 'Priya Patel',
      email: 'priya@demo.com',
      password: 'demo123',
      role: 'worker',
      zone: 'Whitefield',
      riskLevel: 'low',
      avatar: 'PP',
      kycVerified: true
    });

    // 3. Create Policies
    console.log('📜 Creating Policies...');
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7); // 1 week policy

    // Rahul's Standard Policy
    await Policy.create({
      userId: rahul._id,
      level: 'standard',
      premium: 35,
      coverage: 280,
      status: 'active',
      startDate,
      endDate,
      zone: 'Hyderabad Central',
      paymentStatus: 'completed',
      triggers: {
        rainfall: 50,
        aqi: 300,
        temperature: 42,
        humidity: 85,
        windSpeed: 40
      }
    });

    // Priya's Basic Policy (In Safe Zone Whitefield - with discount applied)
    await Policy.create({
      userId: priya._id,
      level: 'basic',
      premium: 18, // Original 20 - 2 discount
      coverage: 200,
      status: 'active',
      startDate,
      endDate,
      zone: 'Whitefield',
      paymentStatus: 'completed',
      triggers: {
        rainfall: 52,
        aqi: 310,
        temperature: 43,
        humidity: 88,
        windSpeed: 45
      }
    });

    // 4. Create some historical Claims for demo
    console.log('💰 Creating Historical Claims...');
    
    await Claim.create({
      userId: rahul._id,
      policyId: (await Policy.findOne({ userId: rahul._id }))._id,
      amount: 280,
      status: 'paid',
      triggerType: 'rainfall',
      triggerValue: 55,
      threshold: 50,
      zone: 'Hyderabad Central',
      fraudScore: 8,
      processedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]
    });

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
