'use strict';

const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const now = new Date();

const createNepaliAddress = () => {
    const provinces = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

    const districts = {
        Koshi: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'],
        Madhesh: ['Parsa', 'Bara', 'Rautahat', 'Sarlahi', 'Dhanusha', 'Siraha', 'Mahottari', 'Saptari'],
        Bagmati: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Dhading', 'Kavrepalanchok', 'Nuwakot', 'Rasuwa', 'Sindhupalchok', 'Chitwan', 'Makwanpur', 'Sindhuli', 'Ramechhap', 'Dolakha'],
        Gandaki: ['Kaski', 'Lamjung', 'Baglung', 'Gorkha', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'],
        Lumbini: ['Rupandehi', 'Dang', 'Kapilvastu', 'Arghakhanchi', 'Gulmi', 'Palpa', 'Pyuthan', 'Rolpa', 'Eastern Rukum', 'Banke', 'Bardiya'],
        Karnali: ['Surkhet', 'Western Rukum', 'Salyan', 'Dolpa', 'Humla', 'Jumla', 'Kalikot', 'Mugu', 'Dailekh', 'Jajarkot'],
        Sudurpashchim: ['Kailali', 'Kanchanpur', 'Achham', 'Doti', 'Bajhang', 'Bajura', 'Dadeldhura', 'Baitadi', 'Darchula']
    };

    const municipalities = {
        // Metropolitan Cities (6 total) :cite[4]:cite[6]
        Kathmandu: ['Kathmandu Metropolitan', 'Budhanilkantha Municipality', 'Tarakeshwar Municipality', 'Gokarneshwar Municipality', 'Chandragiri Municipality', 'Tokha Municipality', 'Kageshwari-Manohara Municipality', 'Nagarjun Municipality'],
        Lalitpur: ['Lalitpur Metropolitan', 'Mahalaxmi Municipality', 'Godawari Municipality'],
        Bhaktapur: ['Bhaktapur Municipality', 'Suryabinayak', 'Madhyapur Thimi'],
        Morang: ['Biratnagar Metropolitan', 'Sundar Haraincha'],
        Kaski: ['Pokhara Metropolitan'],
        Parsa: ['Birgunj Metropolitan'],

        // Sub-Metropolitan Cities (11 total) :cite[4]:cite[6]
        Sunsari: ['Itahari', 'Dharan'],
        Dhanusha: ['Janakpurdham'],
        Rupandehi: ['Butwal', 'Tilottama'],
        Dang: ['Ghorahi', 'Tulsipur'],
        Makwanpur: ['Hetauda'],
        Kailali: ['Dhangadhi'],
        Banke: ['Nepalgunj'],
        Bara: ['Kalaiya', 'Jitpursimara'],

        // Urban Municipalities (examples) :cite[3]:cite[4]
        Jhapa: ['Birtamod', 'Mechinagar', 'Damak'],
        Udayapur: ['Triyuga'],
        Siraha: ['Lahan'],
        Kanchanpur: ['Bhimdatta'],
        Chitwan: ['Bharatpur'],
        Surkhet: ['Birendranagar']
    };

    const province = faker.helpers.arrayElement(provinces);
    const district = faker.helpers.arrayElement(districts[province] || ['Kathmandu']);
    const municipality = faker.helpers.arrayElement(municipalities[district] || ['Kathmandu Metropolitan']);

    const word = faker.word.noun({ length: { min: 4, max: 10 } });
    const streetName = word.charAt(0).toUpperCase() + word.slice(1);

    return {
        street: `${streetName} Tole-${faker.number.int({ min: 1, max: 20 })}`,
        city: district,
        province,
        district,
        municipality,
        ward: String(faker.number.int({ min: 1, max: 32 })),
        zipCode: `44${faker.number.int({ min: 100, max: 999 })}`,
        country: 'Nepal',
    };
};

module.exports = {
    async up(queryInterface) {
        const passwordHash = await bcrypt.hash('Password123!', 12);

        const users = Array.from({ length: 10 }).map(() => {
            const address = createNepaliAddress();

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
                // shippingAddress: null,
                // billingAddress: null,
                shippingAddress: JSON.stringify(address),
                billingAddress: JSON.stringify(address),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        // Admin user
        const adminAddress = {
            street: 'Admin Tole-1',
            city: 'Kathmandu',
            province: 'Bagmati',
            district: 'Kathmandu',
            municipality: 'Kathmandu Metropolitan',
            ward: '1',
            zipCode: '44600',
            country: 'Nepal',
        };

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
            // shippingAddress: null,
            // billingAddress: null,
            shippingAddress: JSON.stringify(adminAddress),
            billingAddress: JSON.stringify(adminAddress),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await queryInterface.bulkInsert('Users', users);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Users', null, {});
    },
};
