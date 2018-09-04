
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;



const Part = sequelize.define('part',
  {
    id: { type: Sequelize.INTEGER, field: 'PartID', primaryKey: true, autoIncrement: true },
    partName: { type: Sequelize.STRING, field: 'PartName' },
    description: { type: Sequelize.STRING, field: 'Description' },
    chipXDim: { type: Sequelize.INTEGER, field: 'ChipXDim' },
    chipYDim: { type: Sequelize.INTEGER, field: 'ChipYDim' },
    partTypeID: { type: Sequelize.INTEGER, field: 'PartTypeID' },
    departmentID: { type: Sequelize.INTEGER, field: 'DepartmentID' },
    partStatus: { type: Sequelize.STRING, field: 'PartStatus' },
    designerEmployeeID: { type: Sequelize.INTEGER, field: 'DesignerEmployeeID' },
    plannerEmployeeID: { type: Sequelize.INTEGER, field: 'PlannerEmployeeID' },
    dutFamily: { type: Sequelize.STRING, field: 'DUTFamily' },
    oracleItemNumber: { type: Sequelize.STRING, field: 'OracleItemNumber' },
    oracleItemStatus: { type: Sequelize.STRING, field: 'OracleItemStatus' },
    oracleDescription: { type: Sequelize.STRING, field: 'OracleDescription' },
    oracleDWSFDeptWSF: { type: Sequelize.STRING, field: 'OracleDWSFDeptWSF' },
    oracleICATItemCategories: { type: Sequelize.STRING, field: 'OracleICATItemCategories' },
    notes: { type: Sequelize.STRING, field: 'Notes' },
    tags: { type: Sequelize.STRING, field: 'Tags' },   
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' },
    itemStatus: { type: Sequelize.STRING, field: 'ItemStatus' },
   
  },
  {
    schema: 'parts',
    tableName: 'Parts',
    timestamps: false,
    hasTrigger: true
  }
);

module.exports = {
  Part: Part
} 
