const sequelize = require('../db/sequelize').sequelize;
const sequelizePLM = require('../db/sequelize').sequelizePLM;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');



function getMyFteSummary(req, res) {

  const employeeID = req.params.employeeID;

  const sql = `
    SELECT
      P.ProjectName AS name,
      SUM(PE.FTE) AS FTE
    FROM
      resources.ProjectEmployees PE
      LEFT JOIN projects.Projects P ON PE.ProjectID = P.ProjectID
    WHERE
      PE.EmployeeID = 58
    GROUP BY
      P.ProjectName
    `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      console.log("returning MyFTESummary");
      res.json(data);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

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

function getQuarterlyEmployeeFTETotals(req, res) {

  const employeeID = req.params.employeeID;
  const fiscalQuarter = req.params.fiscalQuarter;
  const fiscalYear = req.params.fiscalYear

  switch(fiscalQuarter) {
    case '1':
      mo1 = 11;
      mo2 = 12;
      mo3 = 1;
      break;
    case '2':
      mo1 = 2;
      mo2 = 3;
      mo3 = 4;
      break;
    case '3':
      mo1 = 5;
      mo2 = 6;
      mo3 = 7;
      break;
    case '4':
      mo1 = 8;
      mo2 = 9;
      mo3 = 10;
      break;
  }

  const sql = `
    SELECT
      P.ProjectName as name, SUM(PE.FTE) as y
    FROM
      resources.ProjectEmployees PE
      LEFT JOIN projects.Projects P ON PE.ProjectID = P.ProjectID
      LEFT JOIN accesscontrol.Employees E ON PE.EmployeeID = E.EmployeeID
    WHERE
      E.EmployeeID = '${employeeID}'
      AND (MONTH(PE.FiscalDate) = '${mo1}' OR MONTH(PE.FiscalDate) = '${mo2}' OR MONTH(PE.FiscalDate) = '${mo3}')
      AND YEAR(PE.FiscalDate) = ${fiscalYear}
    GROUP BY
      P.ProjectName
    `

  console.log(sql)

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      console.log("returning quarterly employee FTE totals");
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
  getMyFteSummary: getMyFteSummary,
  getProjectFTEHistory: getProjectFTEHistory,
  getTopFTEProjectList: getTopFTEProjectList,
  getProjectEmployeeFTEList: getProjectEmployeeFTEList,
  getQuarterlyEmployeeFTETotals: getQuarterlyEmployeeFTETotals
}
