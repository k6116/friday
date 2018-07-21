const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');


function getNCIProjectsWithDemandList(req, res) {

  const sql = `
    SELECT 
      ProjectName as 'ProjectName*',
      ProjectTypeName as 'ProjectTypeName',
      ChildPartName as 'Childs:ChildPartName',
      ChildPartTypeName as 'Childs:ChildPartTypeName',
      ChildProjectName as 'Childs:ChildProjectName',
      ChildProjectTypeName as 'Childs:ChildProjectTypeName'
    FROM
      analytics.vNCIProjectsWDemandChildren
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(getNCIProjectsWithDemandList => {
      console.log("returning vNCIProjectsWDemandChildren data");
      const NCIProjectsTree = new Treeize();
      NCIProjectsTree.grow(getNCIProjectsWithDemandList);
      const NCIProjects = NCIProjectsTree.getData();
      res.json(NCIProjects);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getNCISupplyDemand(req, res) {

  const sql = `
    SELECT
      NCIProjectName as 'NCIProjectName*',
      SupplyOrDemand as 'Details:SupplyOrDemand*',
      NCIPartName as 'Details:NCIPartName',
      SupplyDemandDate as 'Details:SupplyDemandDate',
      DemandQty as 'Details:DemandQty',
      SupplyQty as 'Details:SupplyQty',
      SupplyDemandDiff as 'Details:SupplyDemandDiff',
      LotListFab as 'Details:LotListFab',
      LotListICTest as 'Details:LotListICTest',
      LotListDieFab as 'Details:LotListDieFab',
      LotListStorage as 'Details:LotListStorage',
      CreationDate as 'Details:CreationDate'
    FROM
      analytics.NCISupplyDemand
    WHERE
      SupplyDemandDiff < 0 AND SupplyDemandDate < DATEADD(month, 6, GETDATE())
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(getNCISupplyDemand => {
      console.log("returning NCISupplyDemand data");
      const NCISupplyDemandTree = new Treeize();
      NCISupplyDemandTree.grow(getNCISupplyDemand);
      const NCISupplyDemand = NCISupplyDemandTree.getData();
      res.json(NCISupplyDemand);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}


module.exports = {
  getNCIProjectsWithDemandList: getNCIProjectsWithDemandList,
  getNCISupplyDemand: getNCISupplyDemand
}
