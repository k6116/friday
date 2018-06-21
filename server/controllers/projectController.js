const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');

function indexProjects(req, res) {

    const sql = `
     SELECT 
        p.ProjectID, 
        substring(p.ProjectName,1,30) as \'ProjectName\', 
        substring(p.Description,1,500) as \'Description\', 
        e.FullName, 
        p.CreationDate, 
        t.ProjectTypeName, 
        p.CreatedBy
    FROM  
        projects.Projects p INNER JOIN projects.ProjectTypes t ON p.ProjectTypeID = t.ProjectTypeID
        INNER JOIN accesscontrol.Employees e on p.CreatedBy = e.EmployeeID
    ORDER BY 
        p.ProjectName`
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {    
     res.json(p);
    })

}

function indexProjectRoster(req, res) {

  const projectID = req.params.projectID;
  const month = moment().utc().startOf('month').format('YYYY-MM-DD')

  const sql = `
    SELECT 
      T1.ProjectID as 'projectID',
      T1.ProjectName as 'projectName',
      T3.FullName as 'teamMembers:name',
      SUM(T2.FTE) as 'teamMembers:fte',
      T4.JobTitleName + ' - ' + T5.JobTitleSubName as 'teamMembers:jobTitle'
    FROM 
      projects.Projects T1
      LEFT JOIN resources.ProjectEmployees T2 ON T1.ProjectID = T2.ProjectID
      LEFT JOIN accesscontrol.Employees T3 ON T2.EmployeeID = T3.EmployeeID
      LEFT JOIN accesscontrol.JobTitle T4 ON T3.JobTitleID = T4.JobTitleID
      LEFT JOIN accesscontrol.JobTitleSub T5 ON T3.JobTitleSubID = T5.JobTitleSubID
    WHERE 
      T1.ProjectID = ${projectID}
    GROUP BY
      T1.ProjectID,
      T1.ProjectName,
      T1.[Description],
      T3.FullName,
      (T4.JobTitleName + ' - ' + T5.JobTitleSubName)
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

function indexUserProjectList(req, res) {

  const userID = req.params.userID;

  const sql = `
    SELECT DISTINCT
      P1.ProjectID as id, P1.ProjectName as projectName, P1.Description as description, P1.Notes as notes, 
      P1.CreatedBy as createdBy, E1.FullName as createdByFullName, P1.CreationDate as createdAt,
      P1.LastUpdatedBy as updatedBy, E2.FullName as updatedByFullName, P1.LastUpdateDate as updatedAt,
      P2.ProjectTypeID as [projectType.id], P2.ProjectTypeName as [projectType.projectTypeName], P2.description as [projectType.description]
    FROM
      projects.Projects P1
      LEFT JOIN projects.ProjectTypes P2 ON P1.ProjectTypeID = P2.ProjectTypeID
      LEFT JOIN resources.ProjectEmployees P3 ON P1.ProjectID = P3.ProjectID
      LEFT JOIN accesscontrol.Employees E1 ON P1.CreatedBy = E1.EmployeeID
      LEFT JOIN accesscontrol.Employees E2 ON P1.LastUpdatedBy = E2.EmployeeID
    WHERE
      P1.CreatedBy = '${userID}' OR P3.EmployeeID = '${userID}'
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(org => {
      console.log("returning user project list");
      res.json(org);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}


function insertProject(req, res) {

  // index the project object from the request body
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
      .then(newProject => {

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

  // index the project object from the request body
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
          notes: project.notes,
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


function destroyProject(req, res) {

  // index the project object and userID from the params
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



function indexProjectTypesList(req, res) {

  models.ProjectTypes.findAll({
    attributes: ['id', 'projectTypeName', 'description'],
  })
  .then(projectType => {
    console.log('Returning Project Type List')
    res.json(projectType);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}

function indexProjectSchedule(req, res) {

  const projectName = req.params.projectName;

  sequelize.query('EXECUTE reports.SchedulesNew :projectName, null', {replacements: {projectName: projectName}, type: sequelize.QueryTypes.SELECT})
    .then(projectSchedule => {
      console.log("returning project schedule");
      res.json(projectSchedule);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

function indexProjectTypeDisplayFields(req, res) {

  models.ProjectTypeDisplayFields.findAll({
    attributes: ['projectField'],
    raw: true,
    include: [
      {
        model: models.ProjectTypes,
        attributes: ['projectTypeName'],
      }
    ]
  })
  .then(ProjectTypeDisplayFields => {
    console.log('WORKED')
    res.json(ProjectTypeDisplayFields);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}

function indexProjectRoles(req, res) {

  models.ProjectRoles.findAll({
    attributes: ['id', 'projectRole'],
  })
  .then(ProjectRoles => {
    console.log('WORKED')
    res.json(ProjectRoles);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}

function indexUserProjectRoles(req, res) {

  const userID = req.params.userID;

  models.ProjectEmployeeRoles.findAll({
    where: {employeeID: userID},
    attributes: ['id', 'projectID', 'employeeID', 'projectRoleID', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'],
    raw: true,
    include: [
      {
        model: models.ProjectRoles,
        attributes: ['projectRole'],
      }
    ]
  })
  .then(indexUserProjectRoles => {
    console.log('WORKED')
    res.json(indexUserProjectRoles);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}

function insertProjectEmployeeRole(req, res) {

  // index the project object from the request body
  const employeeProjectRoleData = req.body;
  const userID = req.params.userID;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.ProjectEmployeeRoles
      .create(
        {
          projectID: employeeProjectRoleData.projectID,
          employeeID: userID,
          projectRoleID: employeeProjectRoleData.projectRoleID,
          createdBy: userID,
          createdAt: today,
          updatedBy: userID,
          updatedAt: today
        },
        {
          transaction: t
        }
      )
      .then(insertProjectEmployeeRole => {

        const projectEmployeeRoleID = insertProjectEmployeeRole.id;
        console.log('created projectEmployeeRoleID is: ' + projectEmployeeRoleID);

      })

    }).then(() => {

      res.json({
        message: `Project Employee Role insert has been made successfully`,
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })
}

function updateProjectEmployeeRole(req, res) {

  // index the project object from the request body
  const employeeProjectRoleData = req.body;
  const userID = req.params.userID;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.ProjectEmployeeRoles
      .update(
        {
          projectID: employeeProjectRoleData.projectID,
          employeeID: userID,
          projectRoleID: employeeProjectRoleData.projectRoleID,
          createdBy: userID,
          createdAt: today,
          updatedBy: userID,
          updatedAt: today
        },
        {
          where: {projectID: employeeProjectRoleData.projectID, employeeID: userID},
          transaction: t
        }
      )
      .then(updateProjectEmployeeRole => {

        console.log('Updated Project Employee Role')
        console.log(updateProjectEmployeeRole);

      })

    }).then(() => {

      res.json({
        message: `The project employee role '${employeeProjectRoleData.projectRole}' has been updated successfully`
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })
}


module.exports = {
  indexProjects: indexProjects,
  indexProjectRoster: indexProjectRoster,
  indexUserProjectList: indexUserProjectList,
  insertProject: insertProject,
  updateProject: updateProject,
  destroyProject: destroyProject,
  indexProjectTypesList: indexProjectTypesList,
  indexProjectSchedule: indexProjectSchedule,
  indexProjectTypeDisplayFields: indexProjectTypeDisplayFields,
  indexProjectRoles: indexProjectRoles,
  indexUserProjectRoles: indexUserProjectRoles,
  insertProjectEmployeeRole: insertProjectEmployeeRole,
  updateProjectEmployeeRole: updateProjectEmployeeRole
}
