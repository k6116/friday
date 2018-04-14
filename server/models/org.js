
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize2017;


const Org = sequelize.define('org',
  {
    id: { type: Sequelize.INTEGER, field: 'id', primaryKey: true, autoIncrement: true },
    lastUpdated: { type: Sequelize.STRING, field: 'lastUpdated' },
    json: { type: Sequelize.STRING, field: 'json' }
  },
  {
    schema: 'dbo',
    tableName: 'NestedOrg',
    timestamps: false
  }
);


module.exports = Org
