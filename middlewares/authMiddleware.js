const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

const protect = async (req, res, next) => {
    try {
        // 1. Get token from cookies
        const token = req.cookies.accessToken;
        if (!token) {
            console.log('No access token found in cookies'.yellow);
            return res.status(401).json({
                success: false,
                message: 'Not authenticated - No token provided'
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find user with active session
        const user = await User.findOne({
            where: {
                id: decoded.userId,
                refreshToken: { [Op.not]: null }, // Has active refresh token
                // If rememberMe is false, check token expiration
                [Op.or]: [
                    { rememberMe: true },
                    { tokenExpiresAt: { [Op.gt]: new Date() } }
                ]
            }
        });

        if (!user) {
            console.log('User not found or session expired'.yellow);
            return res.status(401).json({
                success: false,
                message: 'Session expired - Please login again'
            });
        }

        // 4. Verify token matches last issued token (optional but recommended)
        if (decoded.iat < Math.floor(user.lastTokenRefresh.getTime() / 1000)) {
            console.log('Stale token detected'.yellow);
            return res.status(401).json({
                success: false,
                message: 'Session expired - Please login again'
            });
        }

        // 5. Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:'.red, error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                shouldRefresh: true
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
};

module.exports = protect;