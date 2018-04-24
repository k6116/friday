
// const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize')
// const Treeize = require('treeize');
// const moment = require('moment');


function getProjectList(req, res) {

    sequelize.query('SELECT ProjectID,ProjectName FROM projects.Projects ORDER BY ProjectName', {type: sequelize.QueryTypes.SELECT})
    .then(results => {
        res.json(results);
    })
    .catch(error => {
        res.status(400).json({
            title: 'Error (in catch)',
            error: {message: error}
        })
    });

}

module.exports = {
  getProjectList: getProjectList
}
