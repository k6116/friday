
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const User = sequelize.define('user',
  {
    id: { type: Sequelize.INTEGER, field: 'id', primaryKey: true, autoIncrement: true },
    firstName: { type: Sequelize.STRING, field: 'first_name' },
    lastName: { type: Sequelize.STRING, field: 'last_name' },
    fullName: { type: Sequelize.STRING, field: 'full_name' },
    userName: { type: Sequelize.STRING, field: 'user_name' },
    email: { type: Sequelize.STRING, field: 'email_address' },
    roleID: { type: Sequelize.INTEGER, field: 'role_id' },
    jobTitleID: { type: Sequelize.INTEGER, field: 'job_title_id' },
    jobSubTitleID: { type: Sequelize.INTEGER, field: 'job_subtitle_id' },
    startUpTutorialFTE: { type: Sequelize.BOOLEAN, field: 'startup_tutorial_fte' },
    createdBy: { type: Sequelize.INTEGER, field: 'created_by' },
    createdAt: { type: Sequelize.DATE, field: 'creation_date' },
    updatedBy: { type: Sequelize.INTEGER, field: 'last_updated_by' },
    updatedAt: { type: Sequelize.DATE, field: 'last_update_date' }
  },
  {
    schema: 'account',
    tableName: 'employee',
    timestamps: false
  }
);

module.exports = User
