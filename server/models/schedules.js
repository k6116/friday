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
    scheduleID: { type: Sequelize.INTEGER, field: 'ScheduleID' },
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
    hasTrigger: true
  }
);


// Projects.hasMany(Schedules, {foreignKey: 'id'});
// Schedules.belongsTo(Projects, {foreignKey: 'projectID'});

// Part.hasMany(Schedules, {foreignKey: 'id'});
// Schedules.belongsTo(Part, {foreignKey: 'partID'});

// SchedulesDetail.hasMany(Schedules, {foreignKey: 'id'});
// Schedules.belongsTo(SchedulesDetail, {foreignKey: 'scheduleID'});

module.exports = {
    Schedules: Schedules, 
    SchedulesDetail: SchedulesDetail
  }
  

