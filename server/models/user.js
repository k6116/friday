
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;


const User = sequelize.define('user',
  {
    id: { type: Sequelize.INTEGER, field: 'EmployeeID', primaryKey: true },
    fullName: { type: Sequelize.STRING, field: 'FullName' },
    userName: { type: Sequelize.STRING, field: 'UserName' },
    email: { type: Sequelize.STRING, field: 'EmailAddress' },
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'accesscontrol',
    tableName: 'Employees',
    timestamps: false
  }
);


module.exports = User
