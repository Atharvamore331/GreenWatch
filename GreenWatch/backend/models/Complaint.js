const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Complaint = sequelize.define('Complaint', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    citizenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    desc: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    lng: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    image: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'in-progress', 'resolved'),
        defaultValue: 'pending'
    },
    assignedTo: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

// Setup Associations
User.hasMany(Complaint, { foreignKey: 'citizenId' });
Complaint.belongsTo(User, { foreignKey: 'citizenId', as: 'citizen' });

module.exports = Complaint;
