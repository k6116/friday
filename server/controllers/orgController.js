
const models = require('../models/_index');
const sequelizePLM = require('../db/sequelize').sequelizePLM;
const sequelize = require('../db/sequelize').sequelize2017;


function show(req, res) {
  const emailAddress = req.params.emailAddress;
  sequelize.query('EXECUTE dbo.GetNestedOrgJson :emailAddress', {replacements: {emailAddress: emailAddress}, type: sequelize.QueryTypes.SELECT})
    .then(org => {
      // console.log("returning nested org data");
      res.json(org);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getSubordinatesFlat(req, res) {
  const emailAddress = req.params.emailAddress;
  const sql = `EXEC jarvis.getOrgChart '${emailAddress}'`
  sequelizePLM.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(org => {
      console.log("returning user PLM data");
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
  show: show,
  getSubordinatesFlat: getSubordinatesFlat
}
