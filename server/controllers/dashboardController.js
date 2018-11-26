
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize')
const moment = require('moment');
const Treeize = require('treeize');
const sleep = require('system-sleep');
const jwt = require('jsonwebtoken');
const token = require('../token/token');


function getFTEData(req, res) {

  const startDate = req.params.startDate;
  const endDate = req.params.endDate;
  let emailAddress = req.params.emailAddress;
  if (!emailAddress) {
    const decodedToken = token.decode(req.header('X-Token'), res);
    emailAddress = decodedToken.userData.email;
  }

  console.log('email address in getFTEData function:');
  console.log(emailAddress);
  

  sequelize.query('EXECUTE resources.DashboardFTEData :emailAddress, :startDate, :endDate', 
    {replacements: {emailAddress: emailAddress, startDate: startDate, endDate: endDate}, type: sequelize.QueryTypes.SELECT})
    .then(dashboardData => {

      const dashboardDataTree = new Treeize();
      dashboardDataTree.grow(dashboardData);
      const dashboardDataTreeized = dashboardDataTree.getData();

      res.json(dashboardDataTreeized);

    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

}


// TEMP CODE: for testing datadog alerts
// sleep(5000);

function checkFirstLogin(req, res) {

  const decodedToken = token.decode(req.header('X-Token'), res);

  const sql = `
    SELECT 
      COUNT(*) as ClickCount 
    FROM 
      [resources].[ClickTracking] 
    WHERE 
      EmployeeID = :employeeID
      AND ClickedOn <> 'Login Button'
      AND Page <> 'App Load'
  `;
  
  sequelize.query(sql, {replacements: {employeeID: decodedToken.userData.id, userName: decodedToken.userData.userName}, type: sequelize.QueryTypes.SELECT})
    .then(clickCount => {
      console.log(`click count`);
      console.log(clickCount);
      res.json({
        clickCount
      });
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

}


function checkJobTitle(req, res) {

  const decodedToken = token.decode(req.header('X-Token'), res);

  sequelize.query(`SELECT JobTitleID, JobSubTitleID FROM accesscontrol.Employees WHERE EmployeeID = :employeeID`, {replacements: {employeeID: decodedToken.userData.id}, type: sequelize.QueryTypes.SELECT})
    .then(jobTitle => {
      res.json({
        jobTitle
      });
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

}


function checkProjectRequests(req, res) {

  const decodedToken = token.decode(req.header('X-Token'), res);

  const sql = `
    SELECT
      T1.RequestID,
      T1.RequestStatus,
      T1.RequestedBy,
      T2.ProjectName,
      T3.EmployeeID,
      T3.FullName,
      T3.EmailAddress
    FROM
      resources.ProjectPermissionRequests T1
      INNER JOIN projects.Projects T2 ON T1.ProjectID = T2.ProjectID
      INNER JOIN accesscontrol.Employees T3 ON T2.CreatedBy = T3.EmployeeID
    WHERE
      T1.RequestStatus = 'Submitted'
      AND T3.EmployeeID = :employeeID
  `

  sequelize.query(sql, {replacements: {employeeID: decodedToken.userData.id}, type: sequelize.QueryTypes.SELECT})
    .then(requests => {
      res.json({
        requests
      });
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

}



module.exports = {
  getFTEData: getFTEData,
  checkFirstLogin: checkFirstLogin,
  checkJobTitle: checkJobTitle,
  checkProjectRequests: checkProjectRequests
}
