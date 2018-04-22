
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;


const ClickTracking = sequelize.define('clickTracking',
  {
    id: { type: Sequelize.INTEGER, field: 'ClickID', primaryKey: true, autoIncrement: true },
    clickedDateTime: { type: Sequelize.DATE, field: 'ClickDateTime' },
    employeeID: { type: Sequelize.INTEGER, field: 'EmployeeID' },
    page: { type: Sequelize.STRING, field: 'Page' },
    path: { type: Sequelize.STRING, field: 'Path' },
    clickedOn: { type: Sequelize.STRING, field: 'ClickedOn' },
    text: { type: Sequelize.STRING, field: 'Text' }
  },
  {
    schema: 'resources',
    tableName: 'ClickTracking',
    timestamps: false
  }
);


module.exports = ClickTracking
