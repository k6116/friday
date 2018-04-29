
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const User = require('./user');

const ProjectEmployee = sequelize.define('projectEmployee',
  {
    id: { type: Sequelize.INTEGER, field: 'ProjectEmployeeID', primaryKey: true, autoIncrement: true },
    projectID: { type: Sequelize.INTEGER, field: 'ProjectID' },
    employeeID: { type: Sequelize.INTEGER, field: 'EmployeeID' },
    fiscalDate: { type: Sequelize.DATE, field: 'FiscalDate' },
    fte: { type: Sequelize.DECIMAL, field: 'FTE' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'resources',
    tableName: 'ProjectEmployees',
    timestamps: false
  }
);

// ProjectEmployee.hasMany(User);
// ProjectEmployee.hasMany(User, {foreignKey: 'EmployeeID', targetKey: 'EmployeeID'});
ProjectEmployee.hasMany(User, {foreignKey: 'EmployeeID', sourceKey: 'EmployeeID'});
// User.belongsTo(ProjectEmployee, {foreignKey: 'EmployeeID', targetKey: 'EmployeeID'});

module.exports = ProjectEmployee
