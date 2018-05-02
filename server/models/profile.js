
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const JobTitle = sequelize.define('jobTitle',
    {
        id: { type: Sequelize.INTEGER, field: 'JobTitleID', primaryKey: true, autoIncrement: true },
        jobTitleName: { type: Sequelize.STRING, field: 'JobTitleName' },
        description: { type: Sequelize.STRING, field: 'Description' },    
    },

    {
        schema: 'accesscontrol',
        tableName: 'JobTitle',
        timestamps: false
      }
    );
        
    module.exports = JobTitle