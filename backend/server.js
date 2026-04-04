import app from './src/app.js';
import connectDB from './src/config/database.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log(`
🚀 GigShield Backend Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:${PORT}
🌐 API: http://localhost:${PORT}/api
🏥 Health: http://localhost:${PORT}/health
⚙️  Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ FAILED TO START SERVER
📍 Error: ${error.message}
⚠️  Check MONGODB_URI and IP Whitelist (0.0.0.0/0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    process.exit(1);
  }
};

startServer();
