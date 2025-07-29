
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
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
            rememberMe: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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
            lastTokenRefresh: {
                type: Sequelize.DATE,
                allowNull: true
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

        // Add compound index for firstName and lastName
        await queryInterface.addIndex('users', ['firstName', 'lastName'], {
            name: 'users_full_name_index'
        });

        await queryInterface.addIndex('users', ['email'], {
            unique: true,
            name: 'users_email_unique'
        })

        await queryInterface.addIndex('users', ['phoneNumber'], {
            unique: true,
            name: 'users_phone_unique'
        });

        await queryInterface.addIndex('users', ['lastLoginAt'], {
            name: 'users_last_login_index'
        });

    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('users');
    }
};