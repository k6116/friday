
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;


function show(req, res) {
  const matplanID = req.params.matplanID;
  sequelize.query(`
    SELECT *
    FROM supply.MaterialPlan T1
    LEFT JOIN projects.Projects T2
      ON T1.ProjectID = T2.ProjectID
    LEFT JOIN
      (SELECT T1.ScheduleID,
      T1.ProjectID,
      T2.BuildStatusID,
      T2.NeedByDate,
      T2.NeededQuantity,
      T3.BuildStatusName
      FROM demand.Schedules T1
      LEFT JOIN demand.SchedulesDetail T2
        ON T1.ScheduleID = T2.ScheduleID
      LEFT JOIN projects.BuildStatus T3
	      ON T2.BuildStatusID = T3.BuildStatusID
      ) T3
      ON T1.ProjectID = T3.ProjectID
      AND T1.BuildStatusID = T3.BuildStatusID
    WHERE MaterialPlanID = :matplanID
  `,{replacements: {matplanID: matplanID}, type: sequelize.QueryTypes.SELECT}
  )
  .then(matplan => {
    res.json(matplan);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function indexProjects(req, res) {
  sequelize.query(
    // select NPIs and NMIs
    `SELECT DISTINCT
      T1.ProjectID,
      CONCAT(T1.ProjectName, ' - ', T2.ProjectTypeName) AS ProjectName
    FROM projects.Projects T1
    LEFT JOIN projects.ProjectTypes T2
      ON T1.ProjectTypeID = T2.ProjectTypeID
    WHERE T1.ProjectTypeID IN (2, 13)
    ORDER BY ProjectName`, {type: sequelize.QueryTypes.SELECT}
  )
  .then(matplanList => {
    res.json(matplanList);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function showMatplans(req, res) {
  const projectID = req.params.projectID;
  sequelize.query('EXECUTE supply.showMatplans :projectID',{replacements: {projectID: projectID}, type: sequelize.QueryTypes.SELECT}
  )
  .then(buildList => {
    res.json(buildList);
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
  indexProjects: indexProjects,
  showMatplans: showMatplans
}
