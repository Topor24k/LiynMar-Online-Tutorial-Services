import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, fullName, contactNumber, role } = req.body;

    console.log('📝 Registration attempt:', { email, fullName, contactNumber, role });

    // Check if user already exists (excluding soft-deleted users)
    const userExists = await User.findOne({ email, isDeleted: false });
    
    if (userExists) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        status: 'error',
        message: 'User already exists'
      });
    }

    // Create user data
    const userData = {
      email,
      password,
      fullName: fullName || email.split('@')[0],
      contactNumber: contactNumber || 'N/A',
      role: role || 'admin' // Default role
    };

    // If created by an admin, track it
    if (req.user) {
      userData.createdBy = req.user._id;
    }

    console.log('✅ Creating user with data:', { ...userData, password: '[HIDDEN]' });

    // Create user
    const user = await User.create(userData);

    console.log('✅ User created successfully:', user._id);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          contactNumber: user.contactNumber,
          role: user.role
        },
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('Error details:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password (exclude deleted users)
    const user = await User.findOne({ email, isDeleted: false }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          contactNumber: user.contactNumber,
          role: user.role
        },
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          contactNumber: user.contactNumber,
          role: user.role,
          isActive: user.isActive,
          isDeleted: user.isDeleted
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all users (for checking)
// @route   GET /api/auth/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select('-password');
    
    res.status(200).json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
