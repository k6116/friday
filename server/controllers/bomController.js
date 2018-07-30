
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;


function index(req, res) {
  sequelize.query('SELECT ParentPartID, PartOrProjectName FROM vBillsList WHERE ParentPartID IS NOT NULL ORDER BY PartOrProjectName', {type: sequelize.QueryTypes.SELECT})
    .then(bomsList => {
      // console.log("returning nested org data");
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
      // console.log("returning nested org data");
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
      T1.PartID,
      T1.PartName,
      T2.PartTypeName AS PartType,
      T1.PartStatus,
      T3.FullName AS PlannerName
    FROM parts.parts T1
    LEFT JOIN parts.PartTypes T2 ON T1.PartTypeID = T2.PartTypeID
    LEFT JOIN accesscontrol.Employees T3 ON T1.PlannerEmployeeID = T3.EmployeeID
    WHERE T1.partID = :partID
  `, {replacements: {partID: partID}, type: sequelize.QueryTypes.SELECT})
    .then(bom => {
      // console.log("returning nested org data");
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
  showPartInfo: showPartInfo
}
