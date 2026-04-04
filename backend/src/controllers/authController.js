import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Auth Controller
 * Handles user registration, login, and token management
 */
class AuthController {
  /**
   * POST /register
   * Register a new user
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, phone, zone, role } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required',
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        phone,
        zone: zone || 'Hyderabad Central',
        role: role || 'worker',
      });

      await user.save();

      // Generate token
      const token = AuthController.generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /login
   * Authenticate user and return JWT token
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate inputs
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User account has been deactivated',
        });
      }

      // Compare passwords
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = AuthController.generateToken(user);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token,
          expiresIn: process.env.JWT_EXPIRE || '7d',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /profile
   * Get current user profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /update-profile
   * Update user profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, phone, zone } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { name, phone, zone },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /refresh-token
   * Generate new JWT token
   */
  static async refreshToken(req, res, next) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const token = AuthController.generateToken(user);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token,
          expiresIn: process.env.JWT_EXPIRE || '7d',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /workers
   * Admin: List all registered workers
   */
  static async getWorkers(req, res, next) {
    try {
      const workers = await User.find({ role: 'worker' }).select('-password');
      return res.status(200).json({
        success: true,
        count: workers.length,
        data: workers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper: Generate JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'default-secret',
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      }
    );
  }
}

export default AuthController;
