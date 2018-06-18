
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;
const sequelize2017 = require('../db/sequelize').sequelize2017;

// TO-DO BILL: figure out if we need both employee and org controller (this should be for user data not org)

function show(req, res) {
  const emailAddress = req.params.managerEmailAddress;

  sequelize2017.query('EXECUTE dbo.GetNestedOrgJson :emailAddress', {replacements: {emailAddress: emailAddress}, type: sequelize2017.QueryTypes.SELECT})
    .then(org => {
      console.log("returning nested org data");
      res.json(org);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}


module.exports = {
  show: show
}
