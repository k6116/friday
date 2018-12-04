
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
    notes: { type: Sequelize.TEXT, field: 'Notes' },
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


const Quote = sequelize.define('quote',
  {
    quoteID: { type: Sequelize.INTEGER, field: 'QuoteID', primaryKey: true, autoIncrement: true },
    partID: { type: Sequelize.INTEGER, field: 'PartID' },
    supplierID: { type: Sequelize.INTEGER, field: 'SupplierID' },
    mfgPartNumber: { type: Sequelize.STRING, field: 'MFGPartNumber' },
    leadTime: { type: Sequelize.INTEGER, field: 'LeadTime' },
    minOrderQty: { type: Sequelize.INTEGER, field: 'MinOrderQty' },
    price: { type: Sequelize.DECIMAL, field: 'Price' },
    nreCharge: { type: Sequelize.DECIMAL, field: 'NRECharge' },
    demandForecastMethodID: { type: Sequelize.INTEGER, field: 'DemandForecastMethodID' },
    demandForecastMethodNumber: { type: Sequelize.STRING, field: 'DemandForecastMethodNumber' },
    notes: { type: Sequelize.TEXT, field: 'Notes' }, 
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
    updatedBy: { type: Sequelize.INTEGER, field: 'LastUpdatedBy' },
    updatedAt: { type: Sequelize.DATE, field: 'LastUpdateDate' }
  },
  {
    schema: 'parts',
    tableName: 'Quotes',
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

const Supplier = sequelize.define('supplier',
  {
    supplierID: { type: Sequelize.INTEGER, field: 'SupplierID', primaryKey: true, autoIncrement: true },
    supplierName: { type: Sequelize.STRING, field: 'SupplierName' }
  },
  {
    schema: 'parts',
    tableName: 'Suppliers',
    timestamps: false,
    hasTrigger: true
  }
);

const PurchaseMethod = sequelize.define('purchaseMethod',
  {
    purchaseMethodID: { type: Sequelize.INTEGER, field: 'PurchaseMethodID', primaryKey: true, autoIncrement: true },
    purchaseMethodName: { type: Sequelize.STRING, field: 'PurchaseMethodName' }
  },
  {
    schema: 'supply',
    tableName: 'PurchaseMethod',
    timestamps: false,
    hasTrigger: true
  }
);

// Part.hasMany(Quote, {foreignKey: 'ID'});
// Quote.belongsTo(Part, {foreignKey: 'PartID'});

Quote.belongsTo(Supplier, {foreignKey: 'supplierID', targetKey: 'supplierID'});

module.exports = {
  Part: Part,
  Quote: Quote,
  MaterialOrder: MaterialOrder,
  Supplier: Supplier,
  PurchaseMethod: PurchaseMethod
} 
