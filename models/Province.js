const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Province', {
        id: {
            type: DateTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,

        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50],
            }
        }
    }, {
        timestamps: false
    });
};