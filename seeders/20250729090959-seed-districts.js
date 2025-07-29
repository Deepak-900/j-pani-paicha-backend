'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Seeding districts...');

      // Get all provinces
      const provinces = await queryInterface.sequelize.query(
        'SELECT id, name FROM provinces ORDER BY name',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      // All districts by province (as of current administrative structure)
      const districtsByProvince = {
        'Koshi Province': [
          'Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang',
          'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari',
          'Taplejung', 'Terhathum', 'Udayapur'
        ],
        'Madhesh Province': [
          'Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari',
          'Sarlahi', 'Siraha'
        ],
        'Bagmati Province': [
          'Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok',
          'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli',
          'Sindhupalchok'
        ],
        'Gandaki Province': [
          'Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang',
          'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'
        ],
        'Lumbini Province': [
          'Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu',
          'Parasi', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi'
        ],
        'Karnali Province': [
          'Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot',
          'Mugu', 'Rukum West', 'Salyan', 'Surkhet'
        ],
        'Sudurpashchim Province': [
          'Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula',
          'Doti', 'Kailali', 'Kanchanpur'
        ]
      };

      const districts = [];

      provinces.forEach(province => {
        const provinceDistricts = districtsByProvince[province.name] || [];

        provinceDistricts.forEach(districtName => {
          districts.push({
            id: uuidv4(),
            name: districtName,
            provinceId: province.id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      });

      await queryInterface.bulkInsert('districts', districts, { transaction });
      await transaction.commit();
      console.log(`${districts.length} districts seeded successfully!`);
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding districts:', error);
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('districts', null, {});
  }
};