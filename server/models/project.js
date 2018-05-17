const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const User = require('./user');

const Projects = sequelize.define('projects',
  {
    id: { type: Sequelize.INTEGER, field: 'ProjectID', primaryKey: true, autoIncrement: true },
    projectName: { type: Sequelize.STRING, field: 'ProjectName' },
    description: { type: Sequelize.STRING, field: 'Description' },
    projectNumber: { type: Sequelize.STRING, field: 'ProjectNumber' },
    tcNumber: { type: Sequelize.STRING, field: 'TCNumber' },
    projectStatusID: { type: Sequelize.INTEGER, field: 'ProjectStatusID' },
    projectTypeID: { type: Sequelize.INTEGER, field: 'ProjectTypeID' },
    notes: { type: Sequelize.STRING, field: 'Notes' },
    projectOrgManager: { type: Sequelize.STRING, field: 'ProjectOrgManager'},
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'projects',
    tableName: 'Projects',
    timestamps: false,
    hasTrigger: true
  }
);

const ProjectTypes = sequelize.define('projectTypes',
  {
    id: { type: Sequelize.INTEGER, field: 'ProjectTypeID', primaryKey: true, autoIncrement: true },
    projectTypeName: { type: Sequelize.STRING, field: 'ProjectTypeName' },
    description: { type: Sequelize.STRING, field: 'Description' }
  },
  {
    schema: 'projects',
    tableName: 'ProjectTypes',
    timestamps: false
  }
);

const ProjectAccessRequests = sequelize.define('projectAccessRequests',
  {
    id: { type: Sequelize.INTEGER, field: 'RequestID', primaryKey: true, autoIncrement: true },
    requestStatus: { type: Sequelize.STRING, field: 'RequestStatus' },
    projectID: { type: Sequelize.INTEGER, field: 'ProjectID' },
    requestedBy: { type: Sequelize.INTEGER, field: 'RequestedBy' },
    requestedAt: { type: Sequelize.DATE, field: 'RequestDate' },
    requestNotes: { type: Sequelize.STRING, field: 'RequestNotes' },
    respondedBy: { type: Sequelize.INTEGER, field: 'RespondedBy' },
    respondedAt: { type: Sequelize.DATE, field: 'ResponseDate' },
    responseNotes: { type: Sequelize.STRING, field: 'ResponseNotes' },
  },
  {
    schema: 'resources',
    tableName: 'ProjectAccessRequests',
    timestamps: false,
  }
);

Projects.hasMany(ProjectTypes, {foreignKey: 'ProjectTypeID'});
ProjectTypes.belongsTo(Projects, {foreignKey: 'ProjectTypeID'});

Projects.hasMany(ProjectAccessRequests, {foreignKey: 'ProjectID'});
ProjectAccessRequests.belongsTo(Projects, {foreignKey: 'ProjectID'});

module.exports = {
  Projects: Projects, 
  ProjectTypes: ProjectTypes,
  ProjectAccessRequests: ProjectAccessRequests
}

