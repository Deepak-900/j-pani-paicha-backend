const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
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


// Get current user profile
router.get('/', protect, securityHeaders, userController.getProfile);

// Update user data
router.put('/data', protect, securityHeaders, userController.updateUserData);

// Update password
router.put('/updatePassword', protect, securityHeaders, userController.updatePassword);

// Update profile image
router.put('/updateUserProfile', protect, securityHeaders, singleUpload, handleUploadErrors, userController.updateProfileImage);

module.exports = router;
