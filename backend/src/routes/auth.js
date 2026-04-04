import express from 'express';
import AuthController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Auth Routes
 */

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/update-profile', authMiddleware, AuthController.updateProfile);
router.post('/refresh-token', authMiddleware, AuthController.refreshToken);

export default router;
