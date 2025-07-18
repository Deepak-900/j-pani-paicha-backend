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
router.get('/me', protect, securityHeaders, userController.getProfile);

// Update profile image
// Debug
// router.patch('/updateUserAvatar', (req, res, next) => {
//     console.log("Headers:", req.headers);
//     console.log("Request received at:", new Date());
//     next();
// }, protect, securityHeaders, singleUpload, handleUploadErrors, userController.updateProfileImage);

router.patch('/updateUserAvatar', protect, securityHeaders, singleUpload, handleUploadErrors, userController.updateProfileImage);

// Update user data
router.patch('/updateUserData', protect, securityHeaders, userController.updateUserData);

// Update password
router.patch('/updatePassword', protect, securityHeaders, userController.updatePassword);


module.exports = router;
