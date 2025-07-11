const db = require('../models');
const { User } = db;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const { validationResult } = require('express-validator');
const { where } = require('sequelize');
require('colors');


// Cookie Configuration
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 //7 Days
};

module.exports = {
    register: async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const { firstName, lastName, email, password, phoneNumber } = req.body;

            // check if user exists
            const existingUser = await User.findOne({ where: { email } });

            if (existingUser) {
                console.error('❌ [ERROR] Registration error: Email already in use.'.red.bold);
                return res.status(400).json({ message: 'Email already in use.' });
            }

            // Create user with null addresses
            const user = await User.create({
                firstName,
                lastName,
                email,
                password,
                phoneNumber,
                shippingAddress: null,
                billingAddress: null
            })

            // Return user data (excluding sensitive fields)
            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                role: user.role,
                createdAt: user.createdAt
            };

            console.log('✅ User registered successfully'.green.bold);
            console.log('User Data:', userData);

            return res.status(201).json({
                message: 'User registered successfully',
                user: userData
            });

        } catch (error) {
            next(error);
        }

    },

    login: async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const { email, password } = req.body;

            // 1. Find user with password (using unscoped in include password)
            const user = await User.unscoped().findOne({ where: { email } })
            if (!user) {
                console.error('Login error: User not found');
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // 2. Verify password
            const isMatch = await user.isValidPassword(password);
            if (!isMatch) {
                console.error('Login error: Password mismatch');
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // 3. Generate tokens
            const accessToken = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
            );

            // 4. Update user with refresh token and last login
            await user.update({
                refreshToken,
                tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                lastLoginAt: new Date()
            });

            // 5. Set HTTP-only cookies
            res.cookie('accessToken', accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.cookie('refreshToken', refreshToken, cookieOptions);

            // 6. Prepare user data for response (excluding sensitive fields)
            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                role: user.role,
                lastLoginAt: user.lastLoginAt
            };

            // 7. Send response
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: userData
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

    // Refresh token endpoint
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token required' });
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Find user with refresh token
            const user = await User.unscoped().findOne({
                where: {
                    id: decoded.userId,
                    refreshToken
                }
            });

            if (!user || new Date(user.tokenExpiresAt) < new Date()) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            // Generate new tokens
            const newAccessToken = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            const newRefreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
            );

            // Update refresh token in database
            await user.update({
                refreshToken: newRefreshToken,
                tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            // Set new cookies
            res.cookie('accessToken', newAccessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.cookie('refreshToken', newRefreshToken, cookieOptions);

            return res.status(200).json({
                success: true,
                message: 'Token refreshed successfully'
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
    },

    // Logout endpoint
    logout: async (req, res) => {
        try {
            const { refreshToken } = req.cookies;

            if (refreshToken) {
                // Find and clear the refresh token
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                await User.update(
                    { refreshToken: null, tokenExpiresAt: null },
                    { where: { id: decoded.userId } }
                );
            }

            // Clear cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            return res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            return res.status(500).json({ message: 'Logout failed' });
        }
    }
}