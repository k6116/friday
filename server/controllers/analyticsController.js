const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');


function getNCIProjectsParentChildList(req, res) {

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

  const NCIProjectName = req.params.projectName

  const sql = `
    SELECT
      NCIProjectName as 'NCIProjectName*',
      SupplyOrDemand as 'Details:SupplyOrDemand',
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
   -- WHERE
    --  SupplyDemandDiff < 0 AND SupplyDemandDate < DATEADD(month, 6, GETDATE())
    WHERE
      NCIProjectName = '${NCIProjectName}'
    ORDER BY
      NCIProjectName
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(getNCISupplyDemand => {
      console.log("returning NCISupplyDemand data");
      for (let i = 0; i < getNCISupplyDemand.length; i++) {
        getNCISupplyDemand[i]['Details:SupplyDemandDate'] = moment(getNCISupplyDemand[i]['Details:SupplyDemandDate']).format('YYYY-MM-DD');
      }
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

function getNCISupplyDemandDatesList(req, res) {
  const sql = `
    SELECT DISTINCT
      SupplyDemandDate
    FROM
      analytics.NCISupplyDemand
    WHERE
      SupplyDemandDiff < 0 AND SupplyDemandDate < DATEADD(month, 6, GETDATE())
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(getNCISupplyDemandDatesList => {
      console.log("returning NCISupplyDemandDatesList data");
      for (let i = 0; i < getNCISupplyDemandDatesList.length; i++) {
        getNCISupplyDemandDatesList[i].SupplyDemandDate = moment(getNCISupplyDemandDatesList[i].SupplyDemandDate).format('YYYY-MM-DD');
      }
      res.json(getNCISupplyDemandDatesList);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getNCISupplyDemandProjectList(req, res) {
  const sql = `
    SELECT DISTINCT
      NCIProjectName
    FROM
      analytics.NCISupplyDemand
    WHERE
      SupplyDemandDiff < 0 AND SupplyDemandDate < DATEADD(month, 6, GETDATE())
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(getNCISupplyDemandProjectList => {
      console.log("returning NCISupplyDemandProjectList data");
      res.json(getNCISupplyDemandProjectList);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getNCISupplyDemandPartList(req, res) {

  const NCIProjectName = req.params.projectName

  const sql = `
    SELECT DISTINCT
      NCIPartName
    FROM
      analytics.NCISupply
    WHERE
      NCIProjectName = '${NCIProjectName}'
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(getNCISupplyDemandPartList => {
      console.log("returning getNCISupplyDemandPartList data");
      res.json(getNCISupplyDemandPartList);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getNCISupplyLotList(req, res) {

  const PartName = req.params.partName

  const sql = `
    SELECT DISTINCT
      PartName, Lot
    FROM
      analytics.NCISupplyLots
    WHERE
      PartName IN (${PartName})
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(getNCISupplyLotList => {
      console.log("returning getNCISupplyLotList data");
      res.json(getNCISupplyLotList);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function execUpdateSupplyDemand(req, res) {

  const sql = `
    EXEC analytics.UpdateSupplyDemand
    EXEC analytics.SupplyDemand
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(execUpdateSupplyDemand => {
      console.log("execUpdateSupplyDemand");
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getNCISupplyLotExclusionList(req, res) {

  const PartName = req.params.partName

  const sql = `
    SELECT DISTINCT
      DUT_TYPE as PartName, Name as Lot
    FROM
      analytics.NCISupplyDemandExclusionList
    WHERE
      DUT_TYPE IN (${PartName})
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(getNCISupplyLotExclusionList => {
      console.log("returning getNCISupplyLotExclusionList data");
      res.json(getNCISupplyLotExclusionList);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function insertLotExclusion(req, res) {

  // index the project object from the request body
  const partData = req.body;
  const userID = req.params.userID;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.NCISupplyDemandExclusionList
      .create(
        {
          partName: partData.PartName,
          type: 'Lot',
          lot: partData.Lot,
          createdBy: userID,
          createdAt: today,
        },
        {
          transaction: t
        }
      )
      .then(insertLotExclusion => {

        console.log('created lot exclusion id is: ' + insertLotExclusion);
      })

    }).then(() => {

      res.json({
        message: `The exclusion lot '${partData.Lot}' has been added successfully`,
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}

function destroyLotExclusion(req, res) {

  // index the project object and userID from the params
  const partData = req.body;
  const userID = req.params.userID;

  return sequelize.transaction((t) => {

    return models.NCISupplyDemandExclusionList
      .destroy(
        {
          where: {partName: partData.PartName, lot: partData.Lot},
          transaction: t
        }
      )
      .then(destroyLotExclusion => {

      })

    }).then(() => {

      res.json({
        message: `The projectID '${partData.Lot}' has been deleted successfully`,
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}
    


module.exports = {
  getNCIProjectsParentChildList: getNCIProjectsParentChildList,
  getNCISupplyDemand: getNCISupplyDemand,
  getNCISupplyDemandDatesList: getNCISupplyDemandDatesList,
  getNCISupplyDemandProjectList: getNCISupplyDemandProjectList,
  getNCISupplyDemandPartList: getNCISupplyDemandPartList,
  getNCISupplyLotList: getNCISupplyLotList,
  getNCISupplyLotExclusionList: getNCISupplyLotExclusionList,
  execUpdateSupplyDemand: execUpdateSupplyDemand,
  insertLotExclusion: insertLotExclusion,
  destroyLotExclusion: destroyLotExclusion
}
