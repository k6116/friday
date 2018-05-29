const sequelize = require('../db/sequelize').sequelize;
const sequelizePLM = require('../db/sequelize').sequelizePLM;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');


function getProjectFTEHistory(req, res) {

  const projectID = req.params.projectID;

  const sql = `
    SELECT
      P.ProjectName as projectName, PT.ProjectTypeName as projectTypeName, SUM(PE.FTE) as totalMonthlyFTE,
      PE.FiscalDate as fiscalDate, MONTH(PE.FiscalDate) as fiscalMonth, YEAR(PE.FiscalDate) as fiscalYear
    FROM
      resources.ProjectEmployees PE
      LEFT JOIN projects.Projects P ON PE.ProjectID = P.ProjectID
      LEFT JOIN projects.ProjectTypes PT ON P.ProjectTypeID = PT.ProjectTypeID
    WHERE
      P.ProjectID = '${projectID}'
    GROUP BY
      P.ProjectName, PT.ProjectTypeName, PE.FiscalDate
    `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      console.log("returning project FTE history data");
      res.json(data);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getTopFTEProjectList(req, res) {

  const sql = `
    SELECT
      P.ProjectID as projectID, P.ProjectName as projectName, PT.ProjectTypeName as projectTypeName, PR.PriorityName as priorityName, SUM(PE.FTE) as totalFTE
    FROM
      resources.ProjectEmployees PE
      LEFT JOIN projects.Projects P ON PE.ProjectID = P.ProjectID
      LEFT JOIN projects.ProjectTypes PT ON P.ProjectTypeID = PT.ProjectTypeID
      LEFT JOIN projects.Priority PR ON P.PriorityID = PR.PriorityID
    --WHERE
      --YEAR(PE.FiscalDate) = '2018'
      --AND MONTH(PE.FiscalDate) = '12'
    GROUP BY
      P.ProjectID, P.ProjectName, PR.PriorityName, PT.ProjectTypeName
    ORDER BY
      totalFTE DESC
    `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      console.log("returning top FTE project list");
      res.json(data);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getProjectEmployeeFTEList(req, res) {

  const projectID = req.params.projectID;
  const fiscalDate = req.params.fiscalDate;

  const sql = `
    SELECT
      P.ProjectName as projectName, E.FullName as fullName, JT.JobTitleName as jobTitleName, JTS.JobTitleSubName as jobTitleSubName, PE.FTE as fte
    FROM
      resources.ProjectEmployees PE
      LEFT JOIN projects.Projects P ON PE.ProjectID = P.ProjectID
      LEFT JOIN accesscontrol.Employees E ON PE.EmployeeID = E.EmployeeID
      LEFT JOIN accesscontrol.JobTitle JT ON E.JobTitleID = JT.JobTitleID
      LEFT JOIN accesscontrol.JobTitleSub JTS ON E.JobTitleSubID = JTS.JobTitleSubID
    WHERE
      P.ProjectID = '${projectID}' and FiscalDate = '${fiscalDate}'
    `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      console.log("returning project employee FTE list");
      res.json(data);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

module.exports = {
  getProjectFTEHistory: getProjectFTEHistory,
  getTopFTEProjectList: getTopFTEProjectList,
  getProjectEmployeeFTEList: getProjectEmployeeFTEList
}
