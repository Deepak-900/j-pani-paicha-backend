module.exports = (sequelize) => {
    const Municipality = sequelize.define('Municipality', {
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
            },
        },
    }, {
        timestamps: false,
    });

    Municipality.associate = (models) => {
        Municipality.belongsTo(models.District, {
            foreignKey: 'districtId',
            as: 'district',
        });
        Municipality.hasMany(models.Address, {
            foreignKey: 'municipalityId',
            as: 'addresses',
        });
    };

    return Municipality;
};