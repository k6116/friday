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

Projects.hasMany(ProjectTypes, {foreignKey: 'ProjectTypeID', sourceKey: 'ProjectTypeID' });

module.exports = {
  Projects: Projects, 
  ProjectTypes: ProjectTypes
}

