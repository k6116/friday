
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;


const MaterialPlan = sequelize.define('materialPlan',
  {
    materialPlanID: { type: Sequelize.INTEGER, field: 'MaterialPlanID', primaryKey: true, autoIncrement: true },
    projectID: { type: Sequelize.INTEGER, field: 'ProjectID' },
    buildStatusID: { type: Sequelize.INTEGER, field: 'BuildStatusID' },
    notes: { type: Sequelize.TEXT, field: 'Notes' },
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'supply',
    tableName: 'MaterialPlan',
    timestamps: false,
    hasTrigger: true
  }
);

module.exports = {
  MaterialPlan: MaterialPlan
}
