import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import policyRoutes from './routes/policy.js';
import riskRoutes from './routes/risk.js';
import claimRoutes from './routes/claim.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

const app = express();

/**
 * Middleware
 */

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

/**
 * Routes
 */

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running ✅' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/claim', claimRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
