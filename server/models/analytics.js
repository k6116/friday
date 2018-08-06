const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const User = require('./user');

const NCISupplyDemandExclusionList = sequelize.define('NCISupplyDemandExclusionList',
  {
    id: { type: Sequelize.INTEGER, field: 'NCISupplyDemandLotExListID', primaryKey: true, autoIncrement: true },
    partName: { type: Sequelize.STRING, field: 'DUT_TYPE' },
    type: { type: Sequelize.STRING, field: 'Type' },
    lot: { type: Sequelize.STRING, field: 'Name' },
    createdBy: { type: Sequelize.INTEGER, field: 'CreatedBy' },
    createdAt: { type: Sequelize.DATE, field: 'CreationDate' },
  },
  {
    schema: 'analytics',
    tableName: 'NCISupplyDemandExclusionList',
    timestamps: false,
  }
);

// User.hasMany(NCISupplyDemandExclusionList, {foreignKey: 'id'});
// NCISupplyDemandExclusionList.belongsTo(User, {foreignKey: 'createdBy'});

module.exports = {
  NCISupplyDemandExclusionList: NCISupplyDemandExclusionList
}

