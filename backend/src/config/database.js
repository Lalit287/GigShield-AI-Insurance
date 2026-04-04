import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Supports both local and cloud connections
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gigshield';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    
    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    console.error('⚠️  Using fallback: local MongoDB on localhost:27017');
    process.exit(1);
  }
};

export default connectDB;
