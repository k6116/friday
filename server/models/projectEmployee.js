
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const User = require('./user');
const Projects = require('./project').Projects
const ProjectRoles = require('./project').ProjectRoles

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

const ProjectEmployeeRoles = sequelize.define('projectEmployeeRoles',
  {
    id: { type: Sequelize.INTEGER, field: 'ProjectEmployeeRoleID', primaryKey: true, autoIncrement: true },
    projectID: { type: Sequelize.INTEGER, field: 'ProjectID' },
    employeeID: { type: Sequelize.INTEGER, field: 'EmployeeID' },
    projectRoleID: { type: Sequelize.INTEGER, field: 'ProjectRoleID' },
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' },
  },
  {
    schema: 'resources',
    tableName: 'ProjectEmployeeRoles',
    timestamps: false,
  }
);

Projects.hasMany(ProjectEmployee, {foreignKey: 'id'});
ProjectEmployee.belongsTo(Projects, {foreignKey: 'projectID'});

User.hasMany(ProjectEmployee, {foreignKey: 'id'});
ProjectEmployee.belongsTo(User, {foreignKey: 'employeeID'});

Projects.hasMany(ProjectEmployeeRoles, {foreignKey: 'id'});
ProjectEmployeeRoles.belongsTo(Projects, {foreignKey: 'projectID'});

User.hasMany(ProjectEmployeeRoles, {foreignKey: 'id'});
ProjectEmployeeRoles.belongsTo(User, {foreignKey: 'employeeID'});

ProjectRoles.hasMany(ProjectEmployeeRoles, {foreignKey: 'id'});
ProjectEmployeeRoles.belongsTo(ProjectRoles, {foreignKey: 'projectRoleID'});

module.exports = {
  ProjectEmployee: ProjectEmployee, 
  ProjectEmployeeRoles: ProjectEmployeeRoles
}
