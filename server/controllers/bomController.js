
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;


function index(req, res) {
  sequelize.query('SELECT COALESCE(ParentPartID, ParentProjectID) AS ParentPartID, PartOrProjectName FROM vBillsList ORDER BY PartOrProjectName', {type: sequelize.QueryTypes.SELECT})
    .then(bomsList => {
      res.json(bomsList);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function showSingleBom(req, res) {
  const parentID = req.params.parentID;
  sequelize.query('EXECUTE dbo.BillsDrillDownNew :parentID', {replacements: {parentID: parentID}, type: sequelize.QueryTypes.SELECT})
    .then(bom => {
      res.json(bom);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function showPartInfo(req, res) {
  const partID = req.params.partID;
  sequelize.query(`
    SELECT
      T1.PartID AS id,
      T1.PartName AS name,
      T2.PartTypeName AS type,
      T1.Description AS description
    FROM parts.parts T1
    LEFT JOIN parts.PartTypes T2 ON T1.PartTypeID = T2.PartTypeID
    LEFT JOIN accesscontrol.Employees T3 ON T1.PlannerEmployeeID = T3.EmployeeID
    WHERE T1.partID = :partID
  `, {replacements: {partID: partID}, type: sequelize.QueryTypes.SELECT})
    .then(bom => {
      res.json(bom);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function showProjectInfo(req, res) {
  const projectID = req.params.projectID;
  sequelize.query(`
    SELECT
      T1.ProjectID AS id,
      T1.ProjectName AS name,
      T2.ProjectTypeName AS type,
      T1.Description AS description
    FROM projects.Projects T1
    LEFT JOIN projects.ProjectTypes T2 ON T1.ProjectTypeID = T2.ProjectTypeID
    WHERE T1.ProjectID = :projectID
  `, {replacements: {projectID: projectID}, type: sequelize.QueryTypes.SELECT})
    .then(bom => {
      res.json(bom);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}


module.exports = {
  index: index,
  showSingleBom: showSingleBom,
  showPartInfo: showPartInfo,
  showProjectInfo: showProjectInfo
}
