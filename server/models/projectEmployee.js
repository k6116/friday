
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const User = require('./user');
const Projects = require('./project').Projects
const JobTitle = require('./jobTitle').JobTitle
const JobSubTitle = require('./jobTitle').JobSubTitle

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

const ProjectEmployeePlanning = sequelize.define('projectEmployeePlanning',
  {
    id: { type: Sequelize.INTEGER, field: 'ProjectEmployeesPlanningID', primaryKey: true, autoIncrement: true },
    planName: { type: Sequelize.STRING, field: 'PlanName' },
    projectID: { type: Sequelize.INTEGER, field: 'ProjectID' },
    employeeID: { type: Sequelize.INTEGER, field: 'EmployeeID' },
    fiscalDate: { type: Sequelize.DATE, field: 'FiscalDate' },
    fte: { type: Sequelize.DECIMAL, field: 'FTE' },
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'resources',
    tableName: 'ProjectEmployeesPlanning',
    timestamps: false
  }
);

const ProjectEmployeeRoles = sequelize.define('projectEmployeeRoles',
  {
    id: { type: Sequelize.INTEGER, field: 'ProjectEmployeeRoleID', primaryKey: true, autoIncrement: true },
    projectID: { type: Sequelize.INTEGER, field: 'ProjectID' },
    employeeID: { type: Sequelize.INTEGER, field: 'EmployeeID' },
    jobTitleID: { type: Sequelize.INTEGER, field: 'JobTitleID' },
    jobSubTitleID: { type: Sequelize.INTEGER, field: 'JobSubTitleID' },
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

Projects.hasMany(ProjectEmployeePlanning, {foreignKey: 'id'});
ProjectEmployeePlanning.belongsTo(Projects, {foreignKey: 'projectID'});

Projects.hasMany(ProjectEmployeeRoles, {foreignKey: 'id'});
ProjectEmployeeRoles.belongsTo(Projects, {foreignKey: 'projectID'});

// User.hasMany(ProjectEmployeeRoles, {foreignKey: 'id'});
// ProjectEmployeeRoles.belongsTo(User, {foreignKey: 'employeeID'});

JobTitle.hasMany(ProjectEmployeeRoles, {foreignKey: 'id'});
ProjectEmployeeRoles.belongsTo(JobTitle, {foreignKey: 'jobTitleID'});

JobSubTitle.hasMany(ProjectEmployeeRoles, {foreignKey: 'id'});
ProjectEmployeeRoles.belongsTo(JobSubTitle, {foreignKey: 'jobSubTitleID'});

module.exports = {
  ProjectEmployee: ProjectEmployee, 
  ProjectEmployeePlanning: ProjectEmployeePlanning,
  ProjectEmployeeRoles: ProjectEmployeeRoles
}
