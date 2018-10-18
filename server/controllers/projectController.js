const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');

function indexProjects(req, res) {

    const sql = `
     SELECT 
        p.ProjectID,
        p.ProjectName,
        p.ProjectTypeID,
        t.ProjectTypeName,
        p.Description,
        p.Notes,
        p.Active,
        p.PriorityID,
        py.PriorityName,
        ps.ProjectStatusName,
        p.GroupID,
        g.GroupName,
        ey.EntityName,
        eo.EntityOwnerName,
        p.DepartmentID,
        p.MU,
        p.IBO,
        p.ProjectOwner,
        p.ProjectNumber,
        p.PlanOfRecordFlag,
        p.OracleItemNumber,
        p.NPIHWProjectManager,
        e.FirstName,
        e.LastName,
        e2.EmailAddress,
        p.CreatedBy,
        e.FullName,
        p.CreationDate,
        e2.FullName as 'LastUpdatedBy',
        p.LastUpdateDate
    FROM  
        projects.Projects p
        INNER JOIN accesscontrol.Employees e on p.CreatedBy = e.EmployeeID
        INNER JOIN accesscontrol.Employees e2 ON p.LastUpdatedBy = e2.EmployeeID
        LEFT JOIN projects.ProjectTypes t ON p.ProjectTypeID = t.ProjectTypeID
        LEFT JOIN projects.Priority py ON p.PriorityID = py.PriorityID
        LEFT JOIN projects."Group" g ON p.GroupID = g.GroupID
        LEFT JOIN projects.Entity ey ON p.EntityID = ey.EntityID
        LEFT JOIN projects.EntityOwner eo ON p.EntityOwnerID = eo.EntityOwnerID
        LEFT JOIN projects.ProjectStatus ps ON p.ProjectStatusID = ps.ProjectStatusID
    ORDER BY 
        p.ProjectName`
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {    
     res.json(p);
    })

}


function getProject(req, res) {

  const projectID = req.params.projectID;

  const sql = `
    SELECT 
      p.ProjectID, 
      p.ProjectName, 
      p.Description, 
      p.Notes,
      p.Active,
      p.MU,
      p.IBO,
      p.ProjectNumber,
      p.OracleItemNumber,
      t.ProjectTypeName,
      ps.ProjectStatusName,
      py.PriorityName,
      g.GroupName,
      ey.EntityName,
      eo.EntityOwnerName,
      p.NPIHWProjectManager,
      p.ProjectOwner,
      e.FullName as 'CreatedBy',
      p.CreationDate,
      e2.FullName as 'LastUpdatedBy',
      p.LastUpdateDate
    FROM  
      projects.Projects p 
      INNER JOIN accesscontrol.Employees e on p.CreatedBy = e.EmployeeID
      INNER JOIN accesscontrol.Employees e2 ON p.LastUpdatedBy = e2.EmployeeID
      LEFT JOIN projects.ProjectTypes t ON p.ProjectTypeID = t.ProjectTypeID
      LEFT JOIN projects.Priority py ON p.PriorityID = py.PriorityID
      LEFT JOIN projects."Group" g ON p.GroupID = g.GroupID
      LEFT JOIN projects.Entity ey ON p.EntityID = ey.EntityID
      LEFT JOIN projects.EntityOwner eo ON p.EntityOwnerID = eo.EntityOwnerID
      LEFT JOIN projects.ProjectStatus ps ON p.ProjectStatusID = ps.ProjectStatusID
    WHERE 
      p.ProjectID = ${projectID}`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
  .then(project => {    
    res.json(project);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });

}


function indexProjectsFilterProjectType(req, res) {

  const projectTypes = req.body

  const sql = `
   SELECT 
    p.ProjectID, 
    substring(p.ProjectName,1,30) as \'ProjectName\', 
    substring(p.Description,1,500) as \'Description\', 
    e.FullName, 
    p.CreationDate, 
    t.ProjectTypeName, 
    p.CreatedBy,
    p.ProjectName + ' - ' + t.ProjectTypeName as 'ProjectProjectType'
  FROM  
    projects.Projects p INNER JOIN projects.ProjectTypes t ON p.ProjectTypeID = t.ProjectTypeID
    INNER JOIN accesscontrol.Employees e on p.CreatedBy = e.EmployeeID
  WHERE
    t.ProjectTypeName IN ('NCI', 'NPPI')
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
      T3.EmployeeID as 'teamMembers:employeeID',
      T3.FullName as 'teamMembers:name',
      SUM(T2.FTE) as 'teamMembers:fte',
      T4.JobTitleName + ' - ' + T5.JobSubTitleName as 'teamMembers:jobTitle'
    FROM 
      projects.Projects T1
      LEFT JOIN resources.ProjectEmployees T2 ON T1.ProjectID = T2.ProjectID
      LEFT JOIN accesscontrol.Employees T3 ON T2.EmployeeID = T3.EmployeeID
      LEFT JOIN resources.JobTitle T4 ON T3.JobTitleID = T4.JobTitleID
      LEFT JOIN resources.JobSubTitle T5 ON T3.JobSubTitleID = T5.JobSubTitleID
    WHERE 
      T1.ProjectID = ${projectID}
    GROUP BY
      T1.ProjectID,
      T1.ProjectName,
      T1.[Description],
      T3.EmployeeID, 
      T3.FullName,
      (T4.JobTitleName + ' - ' + T5.JobSubTitleName)
    ORDER BY
      T3.FullName
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

function indexTeamProjectList(req, res) {

  const emailAddress = req.params.emailAddress;

  const sql = `
    SELECT
      P1.ProjectID as id, P1.ProjectName as projectName, P1.Description as description, P1.Notes as notes, P1.ProjectOwner as projectOwner,
      P1.CreatedBy as createdBy, E1.FullName as createdByFullName, P1.CreationDate as createdAt,
      P1.LastUpdatedBy as updatedBy, E2.FullName as updatedByFullName, P1.LastUpdateDate as updatedAt,
      P2.ProjectTypeID as [projectType.id], P2.ProjectTypeName as [projectType.projectTypeName], P2.description as [projectType.description]
    FROM
      projects.Projects P1
      LEFT JOIN projects.ProjectTypes P2 ON P1.ProjectTypeID = P2.ProjectTypeID
      LEFT JOIN accesscontrol.Employees E1 ON P1.CreatedBy = E1.EmployeeID
      LEFT JOIN accesscontrol.Employees E2 ON P1.LastUpdatedBy = E2.EmployeeID
    WHERE
      P1.ProjectOwner = '${emailAddress}'
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(org => {
      console.log("returning team project list");
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
          projectOwner: project.projectOwner,
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

        console.log('created project id is: ' + newProject.id);
        res.json({newProjectID: newProject.id})
      })

    }).then(() => {

      // res.json({
      //   message: `The project '${project.projectName}' has been added successfully`,
      // })

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

  const sql = `
    SELECT
      T2.ProjectTypeID as [id],
      T2.ProjectTypeName as [projectTypeName],
      T2.Description as [description]
    FROM 
      projects.projects T1
      INNER JOIN projects.ProjectTypes T2 ON T1.ProjectTypeID = T2.ProjectTypeID
    GROUP BY
      T2.ProjectTypeID,
      T2.ProjectTypeName,
      T2.Description
    ORDER BY
      T2.ProjectTypeName
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
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


function indexProjectStatusesList(req, res) {

  models.ProjectStatuses.findAll({
    attributes: ['id', 'projectStatusName', 'description'],
  })
  .then(projectStatuses => {
    console.log('Returning Project Statuses List')
    res.json(projectStatuses);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}


function indexProjectPrioritiesList(req, res) {

  const sql = `
    SELECT
      T2.PriorityID as [id],
      T2.PriorityName as [priorityName],
      T2.Description as [description]
    FROM 
      projects.projects T1
      INNER JOIN projects.Priority T2 ON T1.PriorityID = T2.PriorityID
    GROUP BY
      T2.PriorityID,
      T2.PriorityName,
      T2.Description
    ORDER BY
      T2.PriorityName
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(projectPriorities => {
      console.log('Returning Project Priorities List')
      res.json(projectPriorities);
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
          jobTitleID: employeeProjectRoleData.jobTitleID,
          jobSubTitleID: employeeProjectRoleData.jobSubTitleID,
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
          jobTitleID: employeeProjectRoleData.jobTitleID,
          jobSubTitleID: employeeProjectRoleData.jobSubTitleID,
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

function destroyProjectEmployeeRole(req, res) {

  // index the project object from the request body
  const employeeProjectRoleData = req.body;
  const userID = req.params.userID;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.ProjectEmployeeRoles
      .destroy(
        {
          where: {projectID: employeeProjectRoleData.projectID, employeeID: userID},
          transaction: t
        }
      )
      .then(deleteProjectEmployeeRole => {

      })

    }).then(() => {

      res.json({
        message: `The projectEmployeeRole '${employeeProjectRoleData.projectID}' has been deleted successfully`,
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}

function insertBulkProjectEmployeeRole(req, res) {

  // req.body object should include only fields: projectID and projectRoleID
  // e.g {projectID: 15, jobTitleID: 2, jobSubTitleID: 10}
  const projectEmployeeRolesData = req.body;
  const userID = req.params.userID;
  const today = new Date();

  for (let i = 0; i < projectEmployeeRolesData.length; i++) {
    projectEmployeeRolesData[i]['employeeID'] = userID;
    projectEmployeeRolesData[i]['createdBy'] = userID;
    projectEmployeeRolesData[i]['createdAt'] = today;
    projectEmployeeRolesData[i]['updatedBy'] = userID;
    projectEmployeeRolesData[i]['updatedAt'] = today;
  }

  return sequelize.transaction((t) => {

    return models.ProjectEmployeeRoles
      .bulkCreate(
        projectEmployeeRolesData,
        {transaction: t}
      )
      .then((projectEmployeeRoles) => {

        console.log('project employee roles bulk:');
        console.log(projectEmployeeRoles);

      })

    }).then(() => {

      res.json({
        message: `bulk insert was successful`
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'Insert Failed',
        error: {message: error}
      });

    })


}


function indexBuildStatus(req, res) {
  const sql = `
   SELECT 
      BuildStatusID, 
      BuildStatusName                
  FROM  
      projects.BuildStatus
  ORDER BY
      BuildStatusName`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })
}

function indexPLCStatus(req, res) {
  const sql = `
   SELECT 
      PLCStatusID, 
      PLCStatusName                
  FROM  
      projects.PLCStatus
  ORDER BY
      PLCStatusName`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })
}

function indexSetupProjects(req, res) {

  const sql = `
   SELECT 
     *
  FROM  
      projects.Projects
  ORDER BY 
      ProjectName`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })

}

function indexProjectDepartments(req, res) {

  const sql = `
   SELECT 
     *
  FROM  
      projects.Department
  ORDER BY 
      Department`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })

}

function indexProjectGroups(req, res) {

  const sql = `
   SELECT 
     *
  FROM  
      projects.[Group]
  ORDER BY 
      GroupName`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })

}

function indexProjectPriorities(req, res) {

  const sql = `
   SELECT 
     *
  FROM  
      projects.Priority
  ORDER BY 
      PriorityName`
  
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
  .then(p => {    
   res.json(p);
  })

}

function updateProjectSetup(req, res) {

  const project = req.body;
  const userID = req.params.userID;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.Projects
      .update(
        {
          projectName: project.projectName, 
          projectTypeID: project.projectTypeID,
          active: project.active == true ? 1 : 0,  
          planOfRecord: project.planOfRecord == true ? 1 : 0,        
          description: project.description,
          notes: project.notes,
          departmentID: project.departmentID,
          groupID: project.groupID,
          priorityID: project.priorityID,
          projectNumber: project.projectNumber,
          ibo: project.ibo,
          mu: project.mu,
          updatedBy: userID,
          updatedAt: today
        },
        {
          where: {id: project.projectID},
          transaction: t
        }
      )
    }).then(() => {
      res.json({
        message: `The project '${project.projectName}' has been updated successfully`
      })

    }).catch(error => {
      console.log(error);
      res.status(500).json({
        title: 'update project setup failed',
        error: {message: error}
      });
    })
}

function insertProjectSetup(req, res) {

  // index the project object from the request body
  const project = req.body;
  const userID = req.params.userID;
  const today = new Date();


  return sequelize.transaction((t) => {

    return models.Projects
      .create(
        {
          projectName: project.projectName, 
          projectTypeID: project.projectTypeID,
          active: project.active == true ? 1 : 0,  
          planOfRecord: project.planOfRecord == true ? 1 : 0,        
          description: project.description,
          notes: project.notes,
          departmentID: project.departmentID,
          groupID: project.groupID,
          priorityID: project.priorityID,
          projectNumber: project.projectNumber,
          ibo: project.ibo,
          mu: project.mu,
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

        console.log('created project id is: ' + newProject.id);
        res.json({newProjectID: newProject.id})
      })

    }).then(() => {

      // res.json({
      //   message: `The project '${project.projectName}' has been added successfully`,
      // })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}

function destroyProjectSetup(req, res) {

  const projectID = req.params.projectID;   
  const scheduleID = req.params.scheduleID;   
  const userID = req.params.userID;          

  // delete schedules first
  return sequelize.transaction((t) => {    
    return  sequelize.query(`EXECUTE dbo.Schedules 
    :executeType, 
    :scheduleID,
    :projectID,  
    :partID,
    :notes,
    :employeeID,
    :schedule,
    :rowCount,
    :errorNumber,
    :errorMessage`, { replacements: {
        executeType: 'Delete',
        scheduleID: scheduleID,
        projectID: projectID,
        partID: null,
        notes: null,
        employeeID: userID,
        schedule: null,
        rowCount: null,
        errorNumber: null,
        errorMessage: null 
    }, type: sequelize.QueryTypes.SELECT})
      .then(sched => {  
       
       // delete project        
       return models.Projects
       .destroy(
         {
           where: {id: projectID}          
         }
       )
     })
    }).then(() => {    
       res.json({
       message: `The Project '${projectID}' has been deleted successfully`,
      })

    }).catch(error => {    
      console.log(error);
      res.status(500).json({
        title: 'destroy project setup failed',
        error: {message: error}
      });    
    })    
}


module.exports = {
  indexProjects: indexProjects,
  getProject: getProject,
  indexProjectsFilterProjectType: indexProjectsFilterProjectType,
  indexProjectRoster: indexProjectRoster,
  indexUserProjectList: indexUserProjectList,
  indexTeamProjectList: indexTeamProjectList,
  insertProject: insertProject,
  updateProject: updateProject,
  destroyProject: destroyProject,
  indexProjectTypesList: indexProjectTypesList,
  indexProjectStatusesList: indexProjectStatusesList,
  indexProjectPrioritiesList: indexProjectPrioritiesList,
  indexProjectSchedule: indexProjectSchedule,
  indexProjectTypeDisplayFields: indexProjectTypeDisplayFields,
  insertProjectEmployeeRole: insertProjectEmployeeRole,
  updateProjectEmployeeRole: updateProjectEmployeeRole,
  destroyProjectEmployeeRole: destroyProjectEmployeeRole,
  insertBulkProjectEmployeeRole: insertBulkProjectEmployeeRole,
  indexBuildStatus: indexBuildStatus,
  indexPLCStatus: indexPLCStatus,
  indexSetupProjects: indexSetupProjects,
  indexProjectDepartments: indexProjectDepartments,
  indexProjectGroups: indexProjectGroups,
  indexProjectPriorities: indexProjectPriorities,
  updateProjectSetup: updateProjectSetup,
  insertProjectSetup: insertProjectSetup,
  destroyProjectSetup:  destroyProjectSetup
}
