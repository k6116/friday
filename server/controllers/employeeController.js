
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;
const sequelizePLM = require('../db/sequelize').sequelizePLM;
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

function showUserPLMData(req, res) {
  const userEmailAddress = req.params.userEmailAddress;

  const sql = `
    SELECT
      P1.PERSON_ID, P1.LAST_NAME, P1.FIRST_NAME, P1.EMAIL_ADDRESS, P1.SUPERVISOR_ID, P1.SUPERVISOR_LAST_NAME, P1.SUPERVISOR_FIRST_NAME, P2.EMAIL_ADDRESS AS SUPERVISOR_EMAIL_ADDRESS
    FROM
      vPER_ALL_PEOPLE_ORG P1 (NOLOCK)
      LEFT JOIN vPER_ALL_PEOPLE_F P2 (NOLOCK) ON P1.SUPERVISOR_ID = P2.PERSON_ID
    WHERE
      P1.EMAIL_ADDRESS = '${userEmailAddress}'
  `
  sequelizePLM.query(sql, { type: sequelizePLM.QueryTypes.SELECT })
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

function getDesigners(req, res) {    

  const sql = `
    SELECT 
      EmployeeID, 
      FullName
    FROM  
      accesscontrol.Employees
    WHERE
      RoleID = 7
    ORDER BY 
      FullName`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })
}

function getPlanners(req, res) {    

  const sql = `
   SELECT 
      EmployeeID, 
      FullName
    FROM  
      accesscontrol.Employees
    WHERE
      RoleID = 8
    ORDER BY 
      FullName`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })
}

function getEmployeeData(req, res) {  
  
  const emailAddress = req.params.emailAddress;

  const sql = `
   SELECT 
      EmployeeID, 
      FullName
    FROM  
      accesscontrol.Employees
    WHERE
      EmailAddress = '${emailAddress}'
    `
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })
}

module.exports = {
  show: show,
  showUserPLMData: showUserPLMData,
  getDesigners: getDesigners,
  getPlanners: getPlanners,
  getEmployeeData: getEmployeeData
}
