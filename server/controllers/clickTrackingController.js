
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize')
const moment = require('moment');



function insert(req, res) {

  const formData = req.body;
  const userID = req.params.userID;

  models.ClickTracking.create(req.body)
  .then(savedClick => {

    res.json(`click tracking record inserted successfully (${req.body.clickedOn})`);

  })
  .catch(error => {

    // send back a response with an error status code
    res.status(401).json({
      title: 'click tracking record insert failed',
      error: {message: error}
    });
  })

}

module.exports = {
  insert: insert
}
