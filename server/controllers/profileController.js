
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');

function show(req, res) {

    models.Profile.findAll({
        attributes: ['id', 'jobTitleName', 'description']
    })
    .then(profile => {
        console.log('WORKED!')
        res.json(profile);
    })
    .catch(error => {
        res.status(400).json({
            title: 'Error (in catch)',
            error: {message: error}
        })
    })
}

module.exports = {
    show: show
}