'use strict';

const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const now = new Date();

module.exports = {
    async up(queryInterface) {

        console.log('Starting seeder...');


        const passwordHash = await bcrypt.hash('Password123!', 12);

        const users = Array.from({ length: 10 }).map(() => {

            return {
                id: faker.string.uuid(),
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email().toLowerCase(),
                phoneNumber: `+977-${faker.phone.number('98########')}`,
                password: passwordHash,
                profilePicture: `default.png`,
                role: 'customer',
                rememberMe: 'false',
                refreshToken: 'sample-token-' + Math.random().toString(36).substring(2, 15),
                tokenExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
                lastLoginAt: now,
                resetToken: null,
                resetTokenExpires: null,
                lastTokenRefresh: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });



        users.push({
            id: faker.string.uuid(),
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            phoneNumber: '+977-9800000000',
            password: await bcrypt.hash('AdminPassword123!', 12),
            profilePicture: `default.png`,
            role: 'admin',
            rememberMe: 'false',
            refreshToken: 'sample-token-' + Math.random().toString(36).substring(2, 15),
            tokenExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
            lastLoginAt: now,
            resetToken: null,
            resetTokenExpires: null,
            lastTokenRefresh: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log(`Inserting ${users.length} users`);
        await queryInterface.bulkInsert('users', users);
        console.log('Seeder completed');


    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('users', null, {});
    },
};
