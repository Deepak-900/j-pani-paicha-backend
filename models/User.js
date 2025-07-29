// models/user.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { isStrongPassword } = require('validator');

module.exports = (sequelize) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'First name is required' },
                    len: { args: [2, 50], msg: 'First name must be between 2 and 50 characters' },
                },
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Last name is required' },
                    len: { args: [2, 50], msg: 'Last name must be between 2 and 50 characters' },
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: { msg: 'Invalid email format' },
                    notEmpty: { msg: 'Email is required' },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Password is required' },
                    isStrong(value) {
                        if (!isStrongPassword(value)) {
                            throw new Error('Password must be strong.');
                        }
                    },
                },
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'Phone number is required' },
                    // len: [10, 10],
                },
            },
            profilePicture: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'default.png',
                validate: {
                    is: {
                        args: /^[\w\-/]+\.(jpg|jpeg|png|gif)$/i,
                        msg: 'Profile picture must be a valid image file path',
                    },
                },
            },
            role: {
                type: DataTypes.ENUM('customer', 'admin'),
                defaultValue: 'customer',
            },
            rememberMe: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            refreshToken: {
                type: DataTypes.STRING(512),
                allowNull: true
            },
            tokenExpiresAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            lastLoginAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            resetToken: {
                type: DataTypes.STRING,
                allowNull: true
            },
            resetTokenExpiresAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            lastTokenRefresh: {
                type: DataTypes.DATE,
                allowNull: true
            },

            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            hooks: {
                beforeCreate: async (user) => {
                    if (user.password) user.password = await bcrypt.hash(user.password, 12);
                },
                beforeUpdate: async (user) => {
                    if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
                    // Clear reset token when password is changed
                    user.resetToken = null;
                    user.resetTokenExpires = null;
                },
            },
            defaultScope: {
                attributes: { exclude: ['password', 'refreshToken', 'resetToken'] },
            },
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        }
    );

    User.prototype.isValidPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};