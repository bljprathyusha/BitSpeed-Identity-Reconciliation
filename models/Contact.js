const { DataTypes } = require('sequelize');
const sequelize = require('../connection')

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        isEmail: true,
    },
    linkedId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    linkPrecedence: {
        type: DataTypes.ENUM('primary', 'secondary'),
        allowNull: false,
        defaultValue: 'primary'
    }, 
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: true,
    paranoid: true
});

module.exports = Contact;