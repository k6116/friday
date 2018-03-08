
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;


function index(req, res) {

  models.User.findAll({
    // attributes: ['id', 'partNumber', 'description'],
    // order: ['partNumber']
  }).then(users => {
    console.log("Returning users data (all)");
    res.json(users);
  });

}


module.exports = {
  index: index
}
