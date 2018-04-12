
const Sequelize = require('sequelize');
const sequelizePLM = require('../db/sequelize').sequelizePLM;
const sequelize = require('../db/sequelize').sequelize;
const Treeize = require('treeize');

function show(req, res) {

  var managerEmailAddress = req.params.managerEmailAddress;
console.log('wtf');
  sequelizePLM.query('EXEC JARVIS.GetOrgChart :managerEmailAddress', {replacements: {managerEmailAddress: managerEmailAddress}, type: sequelizePLM.QueryTypes.SELECT})
  //sequelize.query("SELECT ProjectName FROM projects.Projects", { type: sequelize.QueryTypes.SELECT})
    .then(function(results){

      var employeeList = new Treeize();
      employeeList.grow(results);
      var employeeList = employeeList.getData();

      res.json(employeeList);
      // console.log('TREEIZE');
      // console.log(employeeList[0]);
      //console.log('non treeize results:');
      // console.log('results');
      // res.json(results);
    })
    .error(function(err){
      console.log(err);
    });

}


module.exports = {
  show: show,
}
