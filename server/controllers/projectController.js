const sequelize = require('../db/sequelize').sequelize;
const sequelizePLM = require('../db/sequelize').sequelizePLM;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');

function getAll(req, res) {
   
    // console.log('reached project controller');

    var sql = 'SELECT p.ProjectID, substring(p.ProjectName,1,30) as \'ProjectName\', substring(p.Description,1,500) as \'Description\', e.FullName, p.CreationDate, t.ProjectTypeName ';
    sql = sql + 'FROM  projects.Projects p INNER JOIN projects.ProjectTypes t ';
    sql = sql + 'ON p.ProjectTypeID = t.ProjectTypeID '
    sql = sql + 'INNER JOIN accesscontrol.Employees e on p.CreatedBy = e.EmployeeID '
    // sql = sql + 'WHERE Active = 1 AND len(p.Description) > 0 '
    sql = sql + 'ORDER BY p.ProjectName '
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {
    // console.log("Returning Projects");
    // console.log(p);
     res.json(p);
    })

}

function getProjectRoster(req, res) {

  const projectID = req.params.projectID;
  const month = moment().utc().startOf('month').format('YYYY-MM-DD')

  const sql = `
    SELECT 
      T1.ProjectID as 'projectID',
      T1.ProjectName as 'projectName',
      T1.[Description] as 'description',
      T3.FullName as 'teamMembers:name',
      T2.FTE as 'teamMembers:fte'
    FROM 
      projects.Projects T1
      LEFT JOIN resources.ProjectEmployees T2 ON T1.ProjectID = T2.ProjectID
      LEFT JOIN accesscontrol.Employees T3 ON T2.EmployeeID = T3.EmployeeID
    WHERE 
      T1.ProjectID = ${projectID}
      AND T2.FiscalDate = '${month}'
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
  .then(projectTeamData => {
    const projectTeamTree = new Treeize();
    projectTeamTree.grow(projectTeamData);
    const projectTeam = projectTeamTree.getData();
    res.json(projectTeam);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });

}

function getUserPLMData(req, res) {
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


function getUserProjectList(req, res) {

  const userID = req.params.userID;

  models.Projects.findAll({
    where: {createdBy: userID},
    attributes: ['id', 'projectName', 'description', 'notes'],
    raw: true,
    include: [{
      model: models.ProjectTypes,
      attributes: ['id', 'projectTypeName', 'description'],
    }]
  })
  .then(project => {
    console.log('WORKED')
    res.json(project);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}


function insertProject(req, res) {

  // get the project object from the request body
  const project = req.body;
  const userID = req.params.userID;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.Projects
      .create(
        {
          projectName: project.projectName,
          description: project.projectDescription,
          projectTypeID: project.projectTypeID,
          notes: project.projectNotes,
          projectOrgManager: project.projectOrgManager,
          createdBy: userID,
          createdAt: today,
          updatedBy: userID,
          updatedAt: today
        },
        {
          transaction: t
        }
      )
      .then(savedProject => {

        console.log('created project id is: ' + project.id);

      })

    }).then(() => {

      res.json({
        message: `The project '${project.projectName}' has been added successfully`,
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}


function updateProject(req, res) {

  // get the project object from the request body
  const project = req.body;
  const userID = req.params.userID;
  const today = new Date();

  console.log('updating existing project:');
  console.log(project);

  return sequelize.transaction((t) => {

    return models.Projects
      .update(
        {
          projectName: project.projectName,
          projectTypeID: project.projectTypeID,
          description: project.projectDescription,
          createdBy: userID,
          createdAt: today,
          updatedBy: userID,
          updatedAt: today
        },
        {
          where: {id: project.projectID},
          transaction: t
        }
      )
      .then(updatedProject => {

        console.log('Updated Project')
        console.log(updatedProject);

      })

    }).then(() => {

      res.json({
        message: `The project '${project.projectName}' has been updated successfully`
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}


function deleteProject(req, res) {

  // get the project object and userID from the params
  const project = req.body;
  const userID = req.params.userID;

  console.log(`deleting project with id: ${project.projectID}`);

  return sequelize.transaction((t) => {

    return models.Projects
      .destroy(
        {
          where: {id: project.projectID},
          transaction: t
        }
      )
      .then(deletedRecordCount => {

        console.log('number of projects deleted in the projects table:')
        console.log(deletedRecordCount);

      })

    }).then(() => {

      res.json({
        message: `The projectID '${project.projectID}' has been deleted successfully`,
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}


function getPrimaryKeyRefs(req, res) {
  
  const pKeyName = req.params.pKeyName;
  const pKeyValue = req.params.pKeyValue;
  const userID = req.params.userID;

  sequelize.query('EXECUTE ref.FindReferencedTables :pKeyName, :pKeyValue, :userID', {replacements: {pKeyName: pKeyName, pKeyValue: pKeyValue, userID: userID}, type: sequelize.QueryTypes.SELECT})
    .then(org => {
      console.log("returning primary key reference table list");
      console.log('EXECUTE ref.FindReferencedTables :pKeyName, :pKeyValue, :userID', {replacements: {pKeyName: pKeyName, pKeyValue: pKeyValue, userID: userID}});
      res.json(org);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}


function getProjectTypesList(req, res) {

  models.ProjectTypes.findAll({
    attributes: ['id', 'projectTypeName', 'description'],
  })
  .then(project => {
    console.log('WORKED')
    res.json(project);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}

module.exports = {
  getAll: getAll,
  getProjectRoster: getProjectRoster,
  getUserPLMData: getUserPLMData,
  getUserProjectList: getUserProjectList,
  insertProject: insertProject,
  updateProject: updateProject,
  deleteProject: deleteProject,
  getPrimaryKeyRefs: getPrimaryKeyRefs,
  getProjectTypesList: getProjectTypesList
}
