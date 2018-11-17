
const models = require('../models/_index');
const sequelizePLM = require('../db/sequelize').sequelizePLM;
const sequelize2017 = require('../db/sequelize').sequelize2017;
const sequelize = require('../db/sequelize').sequelize;
const token = require('../token/token');


// right now, this function doesn't seem to fetch all subordinates.  Example - George Nacouzi doesn't show up under Ethan
function show(req, res) {
  const emailAddress = req.params.emailAddress;
  sequelize2017.query('EXECUTE dbo.GetNestedOrgJson :emailAddress', {replacements: {emailAddress: emailAddress}, type: sequelize.QueryTypes.SELECT})
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
  const sql = `EXEC jarvis.getOrgChart '${emailAddress}'`;
  sequelize2017.query(sql, { type: sequelize.QueryTypes.SELECT })
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

function getTeamList(req, res) {
  const emailAddress = req.params.emailAddress;
  sequelize.query('EXECUTE resources.GetTeamList :emailAddress', {replacements: {emailAddress: emailAddress}, type: sequelize.QueryTypes.SELECT})
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

function getEmployeeList(req, res) {
  const emailAddress = req.params.emailAddress;
  sequelize.query('EXECUTE resources.GetEmployeeList :emailAddress', {replacements: {emailAddress: emailAddress}, type: sequelize.QueryTypes.SELECT})
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

function getOrgFtes(req, res) {
  const emailAddress = req.params.emailAddress;
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;
  sequelize.query(`EXECUTE resources.ManagementOrgFTEs :emailAddress, :startDate, :endDate`, {replacements: {emailAddress: emailAddress, startDate: startDate, endDate: endDate}, type: sequelize.QueryTypes.SELECT})
    .then(org => {
      res.json(org);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getTeamFteList(req, res) {
  const emailAddress = req.params.emailAddress;
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;
  sequelize.query(`EXECUTE resources.GetTeamFTEList :emailAddress, :startDate, :endDate`, {replacements: {emailAddress: emailAddress, startDate: startDate, endDate: endDate}, type: sequelize.QueryTypes.SELECT})
    .then(team => {
      res.json(team);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function getManagementOrgStructure(req, res) {
  const emailAddress = req.params.emailAddress;
  sequelize.query(`EXECUTE resources.ManagementOrgStructure :emailAddress`, {replacements: {emailAddress: emailAddress}, type: sequelize.QueryTypes.SELECT})
    .then(org => {
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
  getSubordinatesFlat: getSubordinatesFlat,
  getTeamList: getTeamList,
  getEmployeeList: getEmployeeList,
  getOrgFtes: getOrgFtes,
  getTeamFteList: getTeamFteList,
  getManagementOrgStructure: getManagementOrgStructure
}
