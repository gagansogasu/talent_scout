const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Validate role
        const validRoles = ['talent', 'recruiter'];
        const userRole = validRoles.includes(role) ? role : 'talent';

        // Create new user
        const user = new User({
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            email: email.toLowerCase(),
            password,
            role: userRole,
            phone: phone || '',
        });

        console.log('Creating new user with role:', userRole);

        // Save user - password will be hashed by the pre-save hook
        await user.save();

        // Create JWT token with enhanced security
        const payload = {
            user: {
                id: user._id || user.id,
                email: user.email,
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                role: user.role || 'talent',
                phone: user.phone || ''
            },
        };

        console.log('Creating JWT token with payload:', payload);

        // Sign token with additional security options
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
            {
                expiresIn: '24h',
                issuer: 'talent-platform',
                audience: 'talent-platform-client',
                algorithm: 'HS256'
            }
        );

        console.log('JWT token generated successfully');

        // Return token and user data (without password)
        const userData = {
            id: user._id || user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: payload.user.name,
            email: user.email,
            role: payload.user.role,
            phone: payload.user.phone,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        console.log('Registration successful, returning user data:', userData);

        res.status(201).json({
            success: true,
            token,
            user: userData
        });

    } catch (error) {
        console.error('Error in register route:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        console.log('Login attempt for email:', email);

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password comparison failed for user:', user.email);
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create JWT token with enhanced security
        const payload = {
            user: {
                id: user._id || user.id,
                email: user.email,
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                role: user.role || 'talent',
                phone: user.phone || ''
            },
        };

        console.log('Creating JWT token with payload:', payload);

        // Sign token with additional security options
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
            {
                expiresIn: '24h',
                issuer: 'talent-platform',
                audience: 'talent-platform-client',
                algorithm: 'HS256'
            }
        );

        console.log('JWT token generated successfully');

        // Return token and user data (without password)
        const userData = {
            id: user._id || user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: payload.user.name,
            email: user.email,
            role: payload.user.role,
            phone: payload.user.phone,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        console.log('Login successful, returning user data:', userData);

        res.json({
            success: true,
            token,
            user: userData
        });

    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // User is already attached to req by auth middleware
        const user = req.user;

        // Format user data consistently
        const userData = {
            id: user._id || user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email,
            role: user.role || 'talent',
            phone: user.phone || '',
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        console.log('Returning user data from /me endpoint:', userData);

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Error in get current user route:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET api/auth/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/users/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
