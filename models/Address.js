module.exports = (sequelize) => {
    const Address = sequelize.define('Address', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        street: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50],
            },
        },
        ward: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: true,
                min: 1,
            },
        },
        zipCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 10],
            },
        },
        country: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'Nepal',
            validate: {
                notEmpty: true,
                len: [2, 50],
            },
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        addressType: {
            type: DataTypes.STRING(25),
            allowNull: false,
            validate: {
                isIn: [['home', 'work', 'billing', 'shipping', 'other']],
            },
        },
    }, {
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    });

    Address.associate = (models) => {
        Address.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        Address.belongsTo(models.Municipality, {
            foreignKey: 'municipalityId',
            as: 'municipality',
        });
    };

    return Address;
};