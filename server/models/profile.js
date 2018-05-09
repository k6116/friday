
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

const JobTitleSub = sequelize.define('jobTitleSub',
    {
        jobTitleSubID: { type: Sequelize.INTEGER, field: 'JobTitleSubID', primaryKey: true, autoIncrement: true },
        jobTitleSubName: { type: Sequelize.STRING, field: 'JobTitleSubName' },
        description: { type: Sequelize.STRING, field: 'Description' },
    },
    {
        schema: 'accesscontrol',
        tableName: 'JobTitleSub',
        timestamps: false
    }
)
    // JobTitle.hasMany(JobTitleSub, {foreignKey: 'JobTitleSubID', sourceKey: 'JobTitleSubID' });
    
const JobTitleJunction = sequelize.define( "jobTitleJunction",
    {
        jobTitleID: { type: Sequelize.STRING, field: 'JobTitleID' },
        jobTitleSubID: { type: Sequelize.STRING, field: 'JobTitleSubID' },
    },
    {
        schema: 'accesscontrol',
        tableName: 'JobTitleJunction',
        timestamps: false
    }
)

    JobTitleJunction.hasMany(JobTitleSub, {foreignKey: 'JobTitleSubID', sourceKey: 'JobTitleSubID' });

    module.exports = {
        JobTitle: JobTitle,
        JobTitleSub: JobTitleSub,
        JobTitleJunction: JobTitleJunction
    }
    