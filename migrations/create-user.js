
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            firstName: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 50]
                }
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 50]
                }
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                    notEmpty: true
                }
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            phoneNumber: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            profilePicture: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'default.png'
            },
            role: {
                type: Sequelize.ENUM('customer', 'admin'),
                defaultValue: 'customer',
                allowNull: false
            },
            refreshToken: {
                type: Sequelize.STRING(512),
                allowNull: true
            },
            tokenExpiresAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            lastLoginAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            resetToken: {
                type: Sequelize.STRING,
                allowNull: true
            },
            resetTokenExpires: {
                type: Sequelize.DATE,
                allowNull: true
            },
            shippingAddress: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: null
            },
            billingAddress: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: null
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Add compound index for firstName and lastName if needed
        await queryInterface.addIndex('Users', ['firstName', 'lastName']);
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('Users');
    }
};