const db = require('../models');
const { User } = db;
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('colors');

// Cookie Configuration
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 //7 Days
};

// Helper function to get safe user data
const getSafeUserData = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profilePicture: user.profilePicture,
    role: user.role,
    rememberMe: user.rememberMe,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
});

module.exports = {
    register: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { firstName, lastName, email, password, phoneNumber } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                console.error('❌ [ERROR] Registration error: Email already in use.'.red.bold);
                return res.status(400).json({ message: 'Email already in use.' });
            }

            const user = await User.create({
                firstName,
                lastName,
                email,
                password,
                phoneNumber,
                shippingAddress: null,
                billingAddress: null
            });

            console.log('✅ User registered successfully'.green.bold);
            return res.status(201).json({
                message: 'User registered successfully',
                user: getSafeUserData(user)
            });
        } catch (error) {
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, rememberMe = false } = req.body;
            const user = await User.unscoped().findOne({ where: { email } });

            if (!user || !(await user.isValidPassword(password))) {
                console.error('Login error: Invalid credentials'.red);
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Set token expiration based on rememberMe
            const accessTokenExpiresIn = rememberMe ? '24h' : '15m'; // 24 hours vs 15 minutes
            const refreshTokenExpiresIn = rememberMe ? '30d' : '7d'; // 30 days vs 7 days
            const tokenExpiresAt = rememberMe
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            // Generate tokens
            const accessToken = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: accessTokenExpiresIn }
            );

            const refreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: refreshTokenExpiresIn }
            );

            // Update user
            await user.update({
                refreshToken,
                rememberMe,
                tokenExpiresAt,
                lastLoginAt: new Date(),
                lastTokenRefresh: new Date()
            });

            // Set cookies
            res.cookie('accessToken', accessToken, {
                ...cookieOptions,
                maxAge: rememberMe ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000 // 24h or 15m
            });

            res.cookie('refreshToken', refreshToken, {
                ...cookieOptions,
                maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30d or 7d
            });

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: getSafeUserData(user)

            });
        } catch (error) {
            console.error('Login error:', error);
            if (error.message.includes('secretOrPrivateKey')) {
                return res.status(500).json({
                    message: 'Server configuration error - JWT secrets not properly set'
                });
            }
            next(error);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token required' });
            }

            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.unscoped().findOne({
                where: {
                    id: decoded.userId,
                    refreshToken
                }
            });

            if (!user || new Date(user.tokenExpiresAt) < new Date()) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            // Maintain the same rememberMe setting from original login
            const rememberMe = user.rememberMe;
            const accessTokenExpiresIn = rememberMe ? '24h' : '15m';
            const refreshTokenExpiresIn = rememberMe ? '30d' : '7d';
            const tokenExpiresAt = rememberMe
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);


            // Generate new tokens
            const newAccessToken = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: accessTokenExpiresIn }
            );

            const newRefreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: refreshTokenExpiresIn }
            );

            // Update user
            await user.update({
                refreshToken: newRefreshToken,
                tokenExpiresAt,
                lastTokenRefresh: new Date()
            });

            // Set cookies
            res.cookie('accessToken', newAccessToken, {
                ...cookieOptions,
                maxAge: rememberMe ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000
            });
            res.cookie('refreshToken', newRefreshToken, {
                ...cookieOptions,
                maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                success: true,
                message: 'Token refreshed successfully'
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }
            next(error);
        }
    },

    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.cookies;

            // Clear cookies
            res.clearCookie('accessToken', cookieOptions);
            res.clearCookie('refreshToken', cookieOptions);

            // Invalidate refresh token in DB if exists
            if (refreshToken) {
                try {
                    const decoded = jwt.decode(refreshToken);
                    if (decoded?.userId) {
                        await User.update(
                            {
                                refreshToken: null,
                                tokenExpiresAt: null,
                                lastTokenRefresh: new Date()
                            },
                            { where: { id: decoded.userId } }
                        );
                    }
                } catch (dbError) {
                    console.error('Database token invalidation error:', dbError);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            next(error);
        }
    },

    checkAuth: async (req, res, next) => {
        try {
            const { accessToken } = req.cookies;

            if (!accessToken) {
                return res.status(200).json({
                    isAuthenticated: false,
                    message: 'No access token found'
                });
            }

            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                const user = await User.findByPk(decoded.userId, {
                    attributes: { exclude: ['password', 'refreshToken', 'tokenExpiresAt'] }
                });

                if (!user) {
                    return res.status(200).json({
                        isAuthenticated: false,
                        message: 'User not found'
                    });
                }

                return res.status(200).json({
                    isAuthenticated: true,
                    user: getSafeUserData(user),
                    rememberMe: user.rememberMe // Include rememberMe status in response
                });
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return await handleExpiredToken(req, res, next);
                }
                return res.status(200).json({
                    isAuthenticated: false,
                    message: 'Invalid access token'
                });
            }
        } catch (error) {
            console.error('Auth check error:', error);
            next(error);
        }
    }
};

async function handleExpiredToken(req, res, next) {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(200).json({
                isAuthenticated: false,
                message: 'No refresh token found'
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findOne({
            where: {
                id: decoded.userId,
                refreshToken,
                tokenExpiresAt: { [db.Sequelize.Op.gt]: new Date() }
            },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(200).json({
                isAuthenticated: false,
                message: 'Invalid or expired refresh token'
            });
        }

        const newAccessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        res.cookie('accessToken', newAccessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000
        });

        await user.update({ lastTokenRefresh: new Date() });

        return res.status(200).json({
            isAuthenticated: true,
            user: getSafeUserData(user)
        });
    } catch (error) {
        console.error('Refresh token handling error:', error);
        return res.status(200).json({
            isAuthenticated: false,
            message: 'Session expired, please login again'
        });
    }
}