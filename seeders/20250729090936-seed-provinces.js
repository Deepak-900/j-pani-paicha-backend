'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();


    try {
      console.log('Seeding provinces...');

      const provinceNames = [
        'Koshi Province',
        'Madhesh Province',
        'Bagmati Province',
        'Gandaki Province',
        'Lumbini Province',
        'Karnali Province',
        'Sudurpashchim Province'
      ];

      const provinces = provinceNames.map(name => ({
        id: uuidv4(),
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('provinces', provinces, { transaction });

      await transaction.commit();
      console.log('Provinces seeded successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding provinces:', error);
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('provinces', null, {});
  }
};
