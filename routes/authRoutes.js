const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator } = require('../middlewares/validators');

// User registration
router.post('/register', registerValidator, authController.register);

module.exports = router;