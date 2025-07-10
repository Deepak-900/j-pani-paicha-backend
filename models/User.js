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
            }, refreshToken: {
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
            resetTokenExpires: {
                type: DataTypes.DATE,
                allowNull: true
            },
            shippingAddress: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,  // Explicit default value
                validate: {
                    isValidAddress(value) {
                        if (value && typeof value === 'object') {
                            const fields = ['street', 'city', 'province', 'district', 'municipality', 'ward', 'zipCode', 'country'];
                            const missing = fields.filter(field => !value[field]);
                            if (missing.length) {
                                throw new Error(`Missing shipping address fields: ${missing.join(', ')}`);
                            }
                        }
                    }
                }
            },
            billingAddress: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,  // Explicit default value
                validate: {
                    isValidAddress(value) {
                        if (value && typeof value === 'object') {
                            const fields = ['street', 'city', 'province', 'district', 'municipality', 'ward', 'zipCode', 'country'];
                            const missing = fields.filter(field => !value[field]);
                            if (missing.length) {
                                throw new Error(`Missing billing address fields: ${missing.join(', ')}`);
                            }
                        }
                    }
                }
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
        }
    );

    User.prototype.isValidPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};