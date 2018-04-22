
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize')
const moment = require('moment');



function insert(req, res) {

  const formData = req.body;
  const userID = req.params.userID;

  console.log('form data:');
  console.log(formData);

  models.ClickTracking.create(req.body)
  .then(savedClick => {

    console.log(savedClick);
    res.json('log click tracking data was successfull');

  })
  .catch(error => {

    // send back a response with an error status code
    res.status(401).json({
      title: 'log click tracking data failed',
      error: {message: error}
    });
  })

}

module.exports = {
  insert: insert
}
