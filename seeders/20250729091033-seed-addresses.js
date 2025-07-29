'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Seeding addresses...');

      // Get required relations
      const [users, municipalities] = await Promise.all([
        queryInterface.sequelize.query(
          `SELECT id FROM users`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        ),
        queryInterface.sequelize.query(
          `SELECT id FROM municipalities`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        )
      ]);

      if (!users.length || !municipalities.length) {
        throw new Error('Users and municipalities must be seeded first');
      }

      // Address types matching your model's enum
      const addressTypes = ['home', 'work', 'billing', 'shipping', 'other'];

      // Nepal-specific address components
      const streetPrefixes = ['New', 'Old', 'Main', 'Upper', 'Lower'];
      const streetSuffixes = ['Road', 'Street', 'Marg', 'Lane', 'Chowk'];

      const addresses = users.map((user, index) => {
        return {
          id: uuidv4(),
          userId: user.id,
          municipalityId: municipalities[index % municipalities.length].id,
          street: `${streetPrefixes[index % streetPrefixes.length]} ${faker.location.street()} ${streetSuffixes[index % streetSuffixes.length]}`,
          ward: faker.number.int({ min: 1, max: 35 }), // Matches your validation (min: 1)
          zipCode: faker.location.zipCode('#####'), // Matches STRING(10)
          country: 'Nepal', // Matches your default value
          isDefault: index === 0, // First address is default
          addressType: addressTypes[index % addressTypes.length], // Matches your enum
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      await queryInterface.bulkInsert('addresses', addresses, { transaction });
      await transaction.commit();
      console.log(`Successfully seeded ${addresses.length} addresses matching your schema`);
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding addresses:', error);
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('addresses', null, {});
  }
};



// Query for fetching user data
// SELECT 
//   u.id AS user_id,
//   u."firstName" || ' ' || u."lastName" AS user_name,
//   a.street,
//   a.ward,
//   a."zipCode",
//   a."addressType",
//   m.name AS municipality,
//   d.name AS district,
//   p.name AS province
// FROM 
//   addresses a
// JOIN 
//   users u ON a."userId" = u.id
// JOIN 
//   municipalities m ON a."municipalityId" = m.id
// JOIN 
//   districts d ON m."districtId" = d.id
// JOIN 
//   provinces p ON d."provinceId" = p.id
// WHERE 
//   u.id = '2f1c72be-def9-4190-88b6-0d9963a97639'; 