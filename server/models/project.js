
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;


const Project = sequelize.define('project',
  {
    id: { type: Sequelize.INTEGER, field: 'ProjectID', primaryKey: true, autoIncrement: true },
    projectName: { type: Sequelize.STRING, field: 'ProjectName' },
    description: { type: Sequelize.STRING, field: 'Description' },
    projectNumber: { type: Sequelize.STRING, field: 'ProjectNumber' }
  },
  {
    schema: 'projects',
    tableName: 'Projects',
    timestamps: false
  }
);


module.exports = Project
