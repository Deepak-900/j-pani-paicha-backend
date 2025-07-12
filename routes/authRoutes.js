// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');
const { registerValidator } = require('../middlewares/validators');

// Cache-control and security headers middleware
const securityHeaders = (req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Credentials': 'true',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    next();
};

// User authentication routes
router.post('/login', securityHeaders, authController.login);
router.post('/register', securityHeaders, registerValidator, authController.register);
router.post('/refresh-token', securityHeaders, authController.refreshToken);

// Protected routes
router.get('/check-auth', protect, securityHeaders, authController.checkAuth);
router.post('/logout', protect, securityHeaders, authController.logout);

module.exports = router;