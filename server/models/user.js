
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const ProjectPermissionRequests = require('./project').ProjectPermissionRequests;

const User = sequelize.define('user',
  {
    id: { type: Sequelize.INTEGER, field: 'EmployeeID', primaryKey: true, autoIncrement: true },
    fullName: { type: Sequelize.STRING, field: 'FullName' },
    userName: { type: Sequelize.STRING, field: 'UserName' },
    email: { type: Sequelize.STRING, field: 'EmailAddress' },
    roleID: { type: Sequelize.INTEGER, field: 'RoleID' },
    jobTitleID: { type: Sequelize.INTEGER, field: 'JobTitleID' },
    jobSubTitleID: { type: Sequelize.INTEGER, field: 'JobSubTitleID' },
    loginEnabled: { type: Sequelize.BOOLEAN, field: 'LoginEnabled' },
    forcePasswordReset: { type: Sequelize.BOOLEAN, field: 'ForcePasswordReset' },
    startUpTutorialFTE: { type: Sequelize.BOOLEAN, field: 'StartUpTutorialFTE' },
    startUpTutorialProjects: { type: Sequelize.BOOLEAN, field: 'StartUpTutorialProjects' },
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

User.hasMany(ProjectPermissionRequests, {foreignKey: 'id'})
ProjectPermissionRequests.belongsTo(User, {foreignKey: 'requestedBy'});

module.exports = User
