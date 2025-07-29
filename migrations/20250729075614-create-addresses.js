'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      municipalityId: {
        type: Sequelize.UUID,
        references: {
          model: 'municipalities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      street: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      ward: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      zipCode: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Nepal'
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      addressType: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('addresses', ['userId']);
    await queryInterface.addIndex('addresses', ['municipalityId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('addresses')
  }
};
