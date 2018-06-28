
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;


const JobTitle = sequelize.define('jobTitle',
    {
        id: { type: Sequelize.INTEGER, field: 'JobTitleID', primaryKey: true, autoIncrement: true },
        jobTitleName: { type: Sequelize.STRING, field: 'JobTitleName' },
        description: { type: Sequelize.STRING, field: 'Description' },    
    },

    {
        schema: 'resources',
        tableName: 'JobTitle',
        timestamps: false
      }
    );

const JobSubTitle = sequelize.define('jobSubTitle',
    {
        id: { type: Sequelize.INTEGER, field: 'JobSubTitleID', primaryKey: true, autoIncrement: true },
        jobSubTitleName: { type: Sequelize.STRING, field: 'JobSubTitleName' },
        description: { type: Sequelize.STRING, field: 'Description' },
    },
    {
        schema: 'resources',
        tableName: 'JobSubTitle',
        timestamps: false
    }
)
    
const JobTitleMap = sequelize.define( "jobTitleMap",
    {
        jobTitleID: { type: Sequelize.STRING, field: 'JobTitleID' },
        jobSubTitleID: { type: Sequelize.STRING, field: 'JobSubTitleID' },
    },
    {
        schema: 'resources',
        tableName: 'JobTitleMap',
        timestamps: false
    }
)

// For junction tables without primary key
JobTitleMap.removeAttribute('id');

JobTitle.hasOne(JobTitleMap, {foreignKey: 'JobTitleID', sourceKey: 'JobTitleID' });
JobTitleMap.hasMany(JobSubTitle, {foreignKey: 'JobSubTitleID', sourceKey: 'JobSubTitleID' });

module.exports = {
    // Employees: Employees,
    JobTitle: JobTitle,
    JobSubTitle: JobSubTitle,
    JobTitleMap: JobTitleMap
}
    