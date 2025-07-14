// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');
const { registerValidator } = require('../middlewares/validators');
const profileController = require('../controllers/userController');
const { singleUpload, handleUploadErrors } = require('../middlewares/uploadMiddleware');


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

// Get current user profile
router.get('/', protect, profileController.getProfile);

// Update user data
router.put('/data', protect, profileController.updateUserData);

// Update password
router.put('/password', protect, profileController.updatePassword);

// Update profile image
router.put('/image', protect, singleUpload, handleUploadErrors, profileController.updateProfileImage);

module.exports = router;