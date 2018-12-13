
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

const MaterialOrder = sequelize.define('materialOrder',
  {
    materialOrderID: { type: Sequelize.INTEGER, field: 'MaterialOrderID', primaryKey: true, autoIncrement: true },
    materialPlanID: { type: Sequelize.INTEGER, field: 'MaterialPlanID' },
    partID: { type: Sequelize.INTEGER, field: 'PartID' },
    supplierID: { type: Sequelize.INTEGER, field: 'SupplierID' },
    purchaseMethodID: { type: Sequelize.INTEGER, field: 'PurchaseMethodID' },
    purchaseOrderNumber: { type: Sequelize.STRING, field: 'PurchaseOrderNumber' },
    orderQty: { type: Sequelize.INTEGER, field: 'OrderQty' },
    orderDate: { type: Sequelize.DATE, field: 'OrderDate' },
    dueDate: { type: Sequelize.DATE, field: 'DueDate' },
    qtyReceived: { type: Sequelize.INTEGER, field: 'QtyReceived' },
    dateReceived: { type: Sequelize.DATE, field: 'DateReceived' },
    deliverTo: { type: Sequelize.STRING, field: 'DeliverTo' },
    notes: { type: Sequelize.TEXT, field: 'Notes' },
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'supply',
    tableName: 'MaterialOrder',
    timestamps: false,
    hasTrigger: true
  }
)

module.exports = {
  MaterialPlan: MaterialPlan,
  MaterialOrder: MaterialOrder
}
