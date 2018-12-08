const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const Projects = require('./project').Projects;
const Part = require('./part').Part;
const User = require('./user');

const Schedules = sequelize.define('schedules',
  {
    id: { type: Sequelize.INTEGER, field: 'ScheduleID', primaryKey: true, autoIncrement: true },
    projectID: { type: Sequelize.INTEGER, field: 'ProjectID' },
    partID: { type: Sequelize.INTEGER, field: 'PartID' },
    currentRevision: { type: Sequelize.INTEGER, field: 'CurrentRevision' },
    notes: { type: Sequelize.STRING, field: 'Notes' },
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'demand',
    tableName: 'Schedules',
    timestamps: false,
  }
);

const SchedulesDetail = sequelize.define('schedulesDetail',
  {
    scheduleID: { type: Sequelize.INTEGER, field: 'ScheduleID', primaryKey: true},
    currentRevision: { type: Sequelize.INTEGER, field: 'CurrentRevision' },
    needByDate: { type: Sequelize.DATE, field: 'NeedByDate' },
    neededQuantity: { type: Sequelize.INTEGER, field: 'NeededQuantity' },
    buildStatusID: { type: Sequelize.INTEGER, field: 'BuildStatusID' },
    plcDateEstimate: { type: Sequelize.DATE, field: 'PLCDateEstimate' },
    plcDateCommit: { type: Sequelize.DATE, field: 'PLCDateCommit' },
    plcDate: { type: Sequelize.DATE, field: 'PLCDate' },
    plcStatusID: { type: Sequelize.INTEGER, field: 'PLCStatusID' },
    notes: { type: Sequelize.STRING, field: 'Notes' },
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'demand',
    tableName: 'SchedulesDetail',
    timestamps: false,
    hasTrigger: true,
  }
);

const BuildStatus = sequelize.define('buildStatus',
  {
    buildStatusID: { type: Sequelize.INTEGER, field: 'BuildStatusID', primaryKey: true, autoIncrement: true },
    buildStatusName: { type: Sequelize.STRING, field: 'BuildStatusName' },
    description: { type: Sequelize.STRING, field: 'Description' }
  },
  {
    schema: 'projects',
    tableName: 'BuildStatus',
    timestamps: false,
  }
);


Schedules.hasMany(SchedulesDetail, {foreignKey: 'scheduleID', sourceKey: 'id'});


module.exports = {
    Schedules: Schedules, 
    SchedulesDetail: SchedulesDetail,
    BuildStatus: BuildStatus
  }
  

