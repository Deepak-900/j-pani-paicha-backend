const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');
const { registerValidator } = require('../middlewares/validators');

// User registration
router.post('/register', registerValidator, authController.register);
router.post('/login', authController.login);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/check-auth', protect, (req, res) => {
    res.json({ isAuthenticated: true, user: req.user });
});

module.exports = router;