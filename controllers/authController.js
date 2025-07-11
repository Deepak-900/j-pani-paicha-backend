const db = require('../models');
const { User } = db;
const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');
const { where } = require('sequelize');
require('colors');


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

    }
}