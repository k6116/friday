
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const User = require('./user');
const Projects = require('./project').Projects

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

Projects.hasMany(ProjectEmployee, {foreignKey: 'id'});
ProjectEmployee.belongsTo(Projects, {foreignKey: 'projectID'});

User.hasMany(ProjectEmployee, {foreignKey: 'id'});
ProjectEmployee.belongsTo(User, {foreignKey: 'employeeID'});

module.exports = ProjectEmployee
