const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    const District = sequelize.define('District', {
        id: {
            type: DataTypes.UUID,
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
        timestamps: false,
    });

    District.associate = (models) => {
        District.belongsTo(models.Province, {
            foreignKey: 'provinceId',
            as: 'province'
        });
        District.hasMany(models.Municipality, {
            foreignKey: 'districtId',
            as: 'municipalities'
        })
    }

    return District;
}