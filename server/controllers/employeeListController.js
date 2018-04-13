
const Sequelize = require('sequelize');
const sequelizePLM = require('../db/sequelize').sequelizePLM;
const sequelize = require('../db/sequelize').sequelize;
const Treeize = require('treeize');

function show(req, res) {

  var managerEmailAddress = req.params.managerEmailAddress;
  console.log('Calling PLM:');
  sequelizePLM.query('EXEC JARVIS.GetOrgChart :managerEmailAddress', {replacements: {managerEmailAddress: managerEmailAddress}, type: sequelizePLM.QueryTypes.SELECT})
    .then(function(results){    
      res.json(results);
    })
    .error(function(err){
      console.log(err);
    });
}

module.exports = {
  show: show,
}
