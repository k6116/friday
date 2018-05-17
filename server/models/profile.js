
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

// const Employees = sequelize.define('employees',
//     {
//         id: { type: Sequelize.INTEGER, field: 'EmployeeID', primaryKey: true, autoIncrement: true },
//         jobTitleID: { type: Sequelize.INTEGER, field: 'JobTitleID' },
//         jobTitleSubID: { type: Sequelize.INTEGER, field: 'JobTitleSubID' },    
//     },
//     {
//         schema: 'accesscontrol',
//         tableName: 'Employees',
//         timestamps: false
//     }
// );

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
        id: { type: Sequelize.INTEGER, field: 'JobTitleSubID', primaryKey: true, autoIncrement: true },
        jobTitleSubName: { type: Sequelize.STRING, field: 'JobTitleSubName' },
        description: { type: Sequelize.STRING, field: 'Description' },
    },
    {
        schema: 'accesscontrol',
        tableName: 'JobTitleSub',
        timestamps: false
    }
)
    
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

// For junction tables without primary key
JobTitleJunction.removeAttribute('id');

JobTitle.hasOne(JobTitleJunction, {foreignKey: 'JobTitleID', sourceKey: 'JobTitleID' });
JobTitleJunction.hasMany(JobTitleSub, {foreignKey: 'JobTitleSubID', sourceKey: 'JobTitleSubID' });

module.exports = {
    // Employees: Employees,
    JobTitle: JobTitle,
    JobTitleSub: JobTitleSub,
    JobTitleJunction: JobTitleJunction
}
    