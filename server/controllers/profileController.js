
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');

function show(req, res) {

    models.JobTitle.findAll({
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

function show2(req, res) {
    var jobTitleID = req.params.jobTitleID;
    models.JobTitleJunction.findAll({
        where: {jobTitleID: jobTitleID },
        attributes: ['JobTitleID', 'JobTitleSubID'],
        raw: true,
        include: [{
            model: models.JobTitleSub,
            // attributes: ['id', 'jobTitleSubName', 'description'],
        }]
    })
    .then(profile => {
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
    show: show,
    show2: show2
}