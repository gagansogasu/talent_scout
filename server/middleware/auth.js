const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided or invalid token format' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token with options
        let decoded;
        const verifyOptions = {
            issuer: 'talent-platform',
            audience: 'talent-platform-client',
            algorithms: ['HS256']
        };

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
                verifyOptions
            );

            console.log('Token decoded successfully:', {
                userId: decoded.user?.id,
                role: decoded.user?.role,
                name: decoded.user?.name
            });

        } catch (jwtError) {
            console.error('JWT verification failed:', {
                error: jwtError.name,
                message: jwtError.message,
                expiredAt: jwtError.expiredAt
            });

            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired',
                    expiredAt: jwtError.expiredAt,
                    code: 'TOKEN_EXPIRED'
                });
            }

            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                    code: 'INVALID_TOKEN',
                    error: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                code: 'AUTH_FAILED',
                error: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
            });
        }

        // Validate token payload
        if (!decoded.user?.id) {
            console.error('Invalid token payload - missing user ID:', decoded);
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload',
                code: 'INVALID_TOKEN_PAYLOAD'
            });
        }

        // Get user from the database
        console.log('Fetching user from database with ID:', decoded.user.id);
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            console.error('User not found for ID:', decoded.user.id);
            return res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Create user object with all necessary fields
        const userData = {
            _id: user._id,
            id: user._id.toString(),
            email: decoded.user.email || user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: decoded.user.name || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            role: decoded.user.role || user.role || 'talent',
            phone: decoded.user.phone || user.phone || '',
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        console.log('User data attached to request:', {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            name: userData.name
        });

        console.log('User authenticated successfully:', {
            id: userData.id,
            email: userData.email,
            role: userData.role
        });

        // Attach user to request object
        req.user = userData;
        console.log('req.user object right before next() in auth middleware:', req.user);
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Not authorized' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        next();
    };
};

module.exports = { auth, checkRole }; 