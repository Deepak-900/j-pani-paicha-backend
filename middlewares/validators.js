const { body } = require('express-validator');

module.exports = {
    registerValidator: [
        body('firstName')
            .trim()
            .notEmpty().withMessage('First name is required')
            .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

        body('lastName')
            .trim()
            .notEmpty().withMessage('Last name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),

        body('password')
            .notEmpty().withMessage('Password is required')
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }).withMessage('Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 symbol'),

        body('phoneNumber')
            .notEmpty().withMessage('Phone number is required')
            .isMobilePhone().withMessage('Invalid phone number format')
    ]
};