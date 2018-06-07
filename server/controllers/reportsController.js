const sequelize = require('../db/sequelize').sequelize;
const sequelizePLM = require('../db/sequelize').sequelizePLM;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');


function translateTimePeriods(period) {
  // compute start and end date for FTE Summary query based on period
  let startMonth;
  let endMonth;
  switch (period) {
    case 'current-quarter': {
      startMonth = moment.utc().startOf('month');
      const secondMonthInQuarter = [2, 5, 8, 11];
      const thirdMonthInQuarter = [0, 3, 6, 9];

      // we want current fiscal quarter to be editable as long as we are in that FQ,
      // so adjust the current month to allow all months in the current quarter to be editable
      if (thirdMonthInQuarter.includes(moment(startMonth).month())) {
        startMonth = moment(startMonth).subtract(2, 'months');
      } else if (secondMonthInQuarter.includes(moment(startMonth).month())) {
        startMonth = moment(startMonth).subtract(1, 'month');
      }
      endMonth = moment(startMonth).add(3, 'months');
      break;
    }
    case 'current-fy': {
      startMonth = moment.utc().startOf('month');
      const monthsInLastFiscalYear = [10, 11];

      if (monthsInLastFiscalYear.includes(moment(startMonth).month())) {
        startMonth = moment(startMonth).set('month', 10);  // set month to Nov
      } else {  // the beginning of the fiscal year was in last calendar year
        startMonth = moment(startMonth).set('month', 10);
        startMonth = moment(startMonth).set('year', (moment(startMonth).year() - 1));
      }
      endMonth = moment(startMonth).add(1, 'year');
      break;
    }
    case 'all-time': {
      startMonth = moment.utc().startOf('year').set('year', 1900);
      endMonth = moment.utc().startOf('year').set('year', 9000);
      break;
    }
  }

  // return the computed start and end dates
  return [moment(startMonth).format('MM/DD/YYYY'), moment(endMonth).format('MM/DD/YYYY')];
}

function getSubordinateProjectRoster(req, res) {
  const managerEmailAddress = req.params.managerEmailAddress;
  const period = req.params.period;
  const datePeriod = translateTimePeriods(period);
  const sql = `EXEC resources.getSubordinateProjectRoster '${managerEmailAddress}', '${datePeriod[0]}', '${datePeriod[1]}'`
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(org => {
      const subordinateProjectTeamTree = new Treeize();
      subordinateProjectTeamTree.grow(org);
      const subordinateProjectTeam = subordinateProjectTeamTree.getData();
      console.log("returning user PLM data");
      res.json(subordinateProjectTeam);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getAggregatedFteData(req, res) {

  const sql = `
    SELECT
      COUNT(DISTINCT T1.EmployeeID) as employeeCount,
      SUM(T1.FTE) AS fteTotals,
      T2.ProjectName AS projectName,
      T2.ProjectID AS projectID,
      T2.FiveYearNetRevenue AS fiveYearRev,
      T3.PriorityName
    FROM resources.ProjectEmployees T1
      LEFT JOIN projects.Projects T2 ON T1.ProjectID = T2.ProjectID
      LEFT JOIN projects.Priority T3 on T2.PriorityID = T3.PriorityID
    GROUP BY
      T2.ProjectName,
      T2.ProjectID,
      T2.FiveYearNetRevenue,
      T3.PriorityName
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
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

function getMyFteSummary(req, res) {

  const employeeID = req.params.employeeID;
  const period = req.params.period;

  const datePeriod = translateTimePeriods(period);
  const sql = `
    SELECT
      P.ProjectName AS name,
      P.projectID,
      0 AS fteTotal, -- for putting project FTE total
      0 AS y,        -- for putting project percent of period FTE total
      PE.FiscalDate AS 'entries:date',
      PE.FTE AS 'entries:fte'
    FROM
      resources.ProjectEmployees PE
      LEFT JOIN projects.Projects P ON PE.ProjectID = P.ProjectID
    WHERE
      PE.EmployeeID = '${employeeID}'
      AND
      PE.FiscalDate BETWEEN '${datePeriod[0]}' AND '${datePeriod[1]}'
    ORDER BY
      name,
      [entries:date]
    `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(data => {
      const myFteTree = new Treeize();
      myFteTree.grow(data);
      const myFtes = myFteTree.getData();
      res.json(myFtes);
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
  getAggregatedFteData: getAggregatedFteData,
  getSubordinateProjectRoster: getSubordinateProjectRoster,
  getMyFteSummary: getMyFteSummary,
  getProjectFTEHistory: getProjectFTEHistory,
  getTopFTEProjectList: getTopFTEProjectList,
  getProjectEmployeeFTEList: getProjectEmployeeFTEList,
  getQuarterlyEmployeeFTETotals: getQuarterlyEmployeeFTETotals
}
