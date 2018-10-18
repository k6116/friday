
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize')
const Treeize = require('treeize');
const moment = require('moment');
const token = require('../token/token');

const Op = sequelize.Op;


function indexUserData(req, res) {

    const decodedToken = token.decode(req.header('X-Token'), res);
    const userID = decodedToken.userData.id;
    sequelize.query('EXECUTE resources.DisplayFTE :userID', {replacements: {userID: userID}, type: sequelize.QueryTypes.SELECT})
    .then(results => {
        const fteTree = new Treeize();
        fteTree.grow(results);
        res.json({
          nested: fteTree.getData(),
          flat: results
        });
    })
    .catch(error => {
        res.status(400).json({
            title: 'Error (in catch)',
            error: {message: error}
        })
    });

}

function destroyUserProject(req, res) {
  
  const decodedToken = token.decode(req.header('X-Token'), res);
  const userID = decodedToken.userData.id;
  const toBeDeletedID = req.params.projectID;
  return sequelize.transaction((t) => {
    return models.ProjectEmployee
    .destroy({
      where: {
        projectID: toBeDeletedID,
        employeeID: userID
      },
      transaction: t
    })
      .then( deletedRows => {
        return models.ProjectEmployeeRoles
        .destroy({
          where: {
            projectID: toBeDeletedID,
            employeeID: userID
          },
          transaction: t
        })
      })
  })
  .then(deletedRows => {
    res.json({
      message: `Project successfully deleted`
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: 'Delete Failed',
      error: error
    });
  })

}

function updateUserData(req, res) {

  const decodedToken = token.decode(req.header('X-Token'), res);
  const userID = decodedToken.userData.id;
  const formData = req.body;
  const updatedValues = [];

  // combine all project arrays into a single array
  const allFormData = [];
  formData.forEach(projectArr => {
    allFormData.push(...projectArr);
  });

  // build arrays of objects for insert and update
  const insertData = [];
  const updateData = [];
  const deleteRecordIds = [];
  const updateIds = [];
  allFormData.forEach(data => {
    // if data needs to be deleted, parse projectIDs and userIDs into delete arrays
    if (data.toBeDeleted) {
      deleteRecordIds.push(data.recordID);
    }
    else {
      // insert array
      if (data.newRecord && data.fte) {
        insertData.push({
            projectID: data.projectID,
            employeeID: userID,
            fiscalDate: moment(data.month).format("YYYY-MM-DD HH:mm:ss"),
            fte: +data.fte / 100, // convert the FTE value to a decimal
            updatedBy: userID,
            updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          }
        )
      }
      // update array
      if (!data.newRecord && data.updated) {
        updateData.push({
          projectID: data.projectID,
          employeeID: userID,
          fiscalDate: moment(data.month).format("YYYY-MM-DD HH:mm:ss"),
          fte: +data.fte / 100, // convert the FTE value to a decimal
          updatedBy: userID,
          updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        })
        // record ids array for updates
        updateIds.push(data.recordID);
      }
    }
  });

  console.log('records for deletion');
  console.log(deleteRecordIds);
  console.log('data to insert');
  console.log(insertData);
  console.log('data to update');
  console.log(updateData);
  console.log('ids for update');
  console.log(updateIds);


  return sequelize.transaction((t) => {

    // insert the new records
    return models.ProjectEmployee
      .destroy({
        where: {
          id: deleteRecordIds
        },
        transaction: t
      })
      .then( deletedRows => {
        updatedValues.push(deletedRows);
        console.log(`${deletedRows} project employee records deleted`);

        return models.ProjectEmployee.bulkCreate(
          insertData,
          {transaction: t}
        )
        .then(savedProjectEmployees => {
  
          updatedValues.push(savedProjectEmployees.length);
          console.log(savedProjectEmployees);
          console.log(`${savedProjectEmployees.length} project employee records inserted`);
  
          // update the existing records
          var promises = [];
          for (var i = 0; i < updateData.length; i++) {
            var newPromise = models.ProjectEmployee.update(
              {
                projectID: updateData[i].projectID,
                employeeID: userID,
                fiscalDate: updateData[i].fiscalDate,
                fte: updateData[i].fte,
                updatedBy: userID,
                updatedAt: updateData[i].updatedAt
              },
              {
                where: { id: updateIds[i] },
                transaction: t
              }
            );
            promises.push(newPromise);
          };
          return Promise.all(promises)
          .then(updatedProjectEmployee => {
            
            updatedValues.push(updatedProjectEmployee.length);
            console.log(`${updatedProjectEmployee.length} project employee records updated`);
            
          });
            
        })

      })
      

    }).then(() => {

      res.json({
        // message: `Save successful!\n
        // ${updatedValues[0]} records deleted\n
        // ${updatedValues[1]} records inserted\n
        // ${updatedValues[2]} records updated`
        message: 'Your FTE values have been successfully saved!'
      })

    }).catch(error => {

      // console.log(error);
      res.status(500).json({
        message: 'update failed',
        error: error
      });

    })

}

function indexTeamData(req, res) {

  const emailAddress = req.params.emailAddress;
  const startDate = req.params.startDate;

  sequelize.query('EXECUTE resources.DisplayTeamFTE :emailAddress, :startDate', {replacements: {emailAddress: emailAddress, startDate: startDate}, type: sequelize.QueryTypes.SELECT})
  .then(results => {
      const fteTree = new Treeize();
      fteTree.grow(results);
      res.json({
        nested: fteTree.getData(),
        flat: results
      });
  })
  .catch(error => {
      res.status(400).json({
          title: 'Error (in catch)',
          error: {message: error}
      })
  });

}


function updateTeamData(req, res) {

  const formData = req.body;
  const userID = req.params.userID;
  const planName = req.params.planName;

  // combine all project arrays into a single array
  const insertData = [];

  formData.forEach(data => {
    if (data.fte !== null) {
      insertData.push({
        planName: planName,
        projectID: data.projectID,
        employeeID: data.employeeID,
        fiscalDate: moment(data.month).utc().format("YYYY-MM-DD"),
        fte: +data.fte / 100, // convert the FTE value to a decimal
        createdBy: userID,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
        }
      )
    }
  });

  console.log('insertData3');
  console.log(insertData);

  return sequelize.transaction((t) => {

    // insert the new records
    return models.ProjectEmployeePlanning
      .destroy({
        where: {
          planName: planName,
          createdBy: userID
        },
        transaction: t
      })
      .then( deletedRows => {

        return models.ProjectEmployeePlanning.bulkCreate(
          insertData,
          {transaction: t}
        )
        .then(savedProjectEmployees => {
          console.log(savedProjectEmployees);
          console.log(`${savedProjectEmployees.length} project employee records inserted`);
        })
      })
      .catch(error => {
        // console.log(error);
        res.status(500).json({
          message: 'delete failed',
          error: error
        });
  
      })

    }).then(() => {

      res.json({
        message: 'Your FTE values have been successfully saved!'
      })

    }).catch(error => {
      // console.log(error);
      res.status(500).json({
        message: 'update failed',
        error: error
      });

    })

}

function destroyTeamProject(req, res) {
  
  const toBeDeletedID = req.body.projectID;
  const toBeDeletedName = req.body.projectName;

  return models.ProjectEmployeePlanning
  .destroy({
    where: {
      projectID: toBeDeletedID,
    }})
  .then(deletedRows => {
    console.log(`${deletedRows} project employee records deleted`);
    res.json({
      message: `Successfully deleted project ${toBeDeletedName}`
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: 'Delete Failed',
      error: error
    });
  })

}

function indexNewPlan(req, res) {

  // this function executes an SP that will copy all subordinates fte data into the 
  // ProjectEmployeesPlanning table for use as a "staging" table for managers

  const emailAddress = req.params.emailAddress;
  const userID = req.params.userID;
  const planName = req.params.planName;
  const firstMonth = req.params.firstMonth;

  sequelize.query('EXECUTE resources.ProjectEmployeesNewPlan :emailAddress, :firstMonth, :userID, :planName', {replacements: {emailAddress: emailAddress, firstMonth: firstMonth, userID: userID, planName: planName}, type: sequelize.QueryTypes.SELECT})
  .then(results => {
      const fteTree = new Treeize();
      fteTree.grow(results);
      res.json({
        nested: fteTree.getData(),
        flat: results
      });
  })
  .catch(error => {
      res.status(400).json({
          title: 'Error (in catch)',
          error: {message: error}
      })
  });

}

function indexPlan(req, res) {

  // this function retrieves a specific plan for a user

  const emailAddress = req.params.emailAddress;
  const planName = req.params.planName;

  const sql = `
    SELECT
      PEP.PlanName as planName,
      P.ProjectID as projectID,
      P.ProjectName as projectName,
      PEP.ProjectEmployeesPlanningID as [allocations:recordID], -- Alias for Treeize
      PEP.LaunchDate as [allocations:launchDate],
      E.FullName as [allocations:fullName], 
      PEP.EmployeeID as [allocations:employeeID],
      PEP.FiscalDate as [allocations:fiscalDate],
      PEP.FTE as [allocations:fte]
    FROM
      resources.ProjectEmployeesPlanning PEP
      LEFT JOIN accesscontrol.Employees E ON PEP.EmployeeID = E.EmployeeID
      LEFT JOIN projects.Projects P ON PEP.ProjectID = P.ProjectID
      LEFT JOIN accesscontrol.Employees E2 ON PEP.CreatedBy = E2.EmployeeID
    WHERE
      PEP.PlanName = '${planName}' AND E2.EmailAddress = '${emailAddress}'
    ORDER BY
      P.ProjectName
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(indexPlan => {
      console.log("returning indexPlan data");
      const fteTree = new Treeize();
      fteTree.grow(indexPlan);
      res.json({
        nested: fteTree.getData(),
        flat: indexPlan
      });
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });


}

function indexPlanList(req, res) {

  // This function retrieves all plans created by the user

  const emailAddress = req.params.emailAddress;

  const sql = `
    SELECT DISTINCT
      T1.PlanName as planName, MAX(T1.LastUpdateDate) as lastUpdateDate
    FROM
      resources.ProjectEmployeesPlanning T1
      LEFT JOIN accesscontrol.Employees E ON T1.CreatedBy = E.EmployeeID
    WHERE
      E.EmailAddress = '${emailAddress}'
    GROUP BY
      T1.PlanName
    ORDER BY
      LastUpdateDate DESC
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(indexPlanList => {
      console.log("returning indexPlanList data");
      res.json(indexPlanList);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

}

function destroyPlan(req, res) {
  
  const planData = req.body;

  return models.ProjectEmployeePlanning
  .destroy({
    where: {
      planName: planData.planName,
      createdBy: planData.userID
    }})
  .then(deletedRows => {
    console.log(`${deletedRows} project employee plan deleted`);
    res.json({
      message: `Successfully deleted plan ${planData.planName}`
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: 'Delete Failed',
      error: error
    });
  })

}

function launchPlan(req, res) {

  // this function executes an SP that will copy all subordinates fte data into the 
  // ProjectEmployeesPlanning table for use as a "staging" table for managers

  const emailAddress = req.params.emailAddress;
  const userID = req.params.userID;
  const planName = req.params.planName;
  const firstMonth = req.params.firstMonth;

  sequelize.query('EXECUTE resources.ProjectEmployeesLaunchPlan :emailAddress, :firstMonth, :userID, :planName', {replacements: {emailAddress: emailAddress, firstMonth: firstMonth, userID: userID, planName: planName}, type: sequelize.QueryTypes.SELECT})
  .then(results => {
    res.json({
      message: `Successfully launched plan.`
    });
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });

}

function checkTeamJobTitle(req, res) {

  // emailAddress param should be in the format 'email1@email.com','email2@email.com'
  const emailAddress = req.params.emailAddress;

  console.log(emailAddress)

  const sql = `
    SELECT
      COUNT(FullName) as numOfEmployees
    FROM
      accesscontrol.Employees
    WHERE
      EmailAddress IN (${emailAddress})
      AND JobTitleID IS NOT NULL
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(numOfEmployees => {
      res.json(numOfEmployees);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

}

function checkTeamFTEAdminPermission(req, res) {

  const decodedToken = token.decode(req.header('X-Token'), res);

  const sql = `
    SELECT
      E.FullName
    FROM
      accesscontrol.Employees E
      LEFT JOIN accesscontrol.RolePermissions RP ON E.RoleID = RP.RoleID
      LEFT JOIN accesscontrol.Permissions P1 ON RP.PermissionID = P1.PermissionID
      LEFT JOIN accesscontrol.EmployeePermissions EP ON E.EmployeeID = EP.EmployeeID
      LEFT JOIN accesscontrol.Permissions P2 ON EP.PermissionID = P2.PermissionID
    WHERE
      E.EmployeeID = ${decodedToken.userData.id}
      AND (P1.PermissionName = 'Resources > FTE Entry > Team FTEs > Admin View'
      OR P2.PermissionName = 'Resources > FTE Entry > Team FTEs > Admin View')
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })   
    .then(permExists => {
      res.json(permExists);

    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

}

function compareFTEToPlan(req, res) {

  //This query will return any updates the user made to their FTEs compared to a plan in the TeamFTEs
  // This way a manager can tell if their plan is out of sync with the real time FTEs and can decide to sync or not
  const emailAddress = req.params.emailAddress;
  const userID = req.params.userID;
  const planName = req.params.planName;
  const firstMonth = req.params.firstMonth;

  sequelize.query('EXECUTE resources.ProjectEmployeesPlanSync :emailAddress, :firstMonth, :userID, :planName', 
    {replacements: {emailAddress: emailAddress, firstMonth: firstMonth, userID: userID, planName: planName}, type: sequelize.QueryTypes.SELECT})
    .then(planSync => {
      res.json(planSync);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

}

module.exports = {
  indexUserData: indexUserData,
  destroyUserProject: destroyUserProject,
  updateUserData: updateUserData,
  indexTeamData: indexTeamData,
  updateTeamData: updateTeamData,
  destroyTeamProject: destroyTeamProject,
  indexNewPlan: indexNewPlan,
  indexPlan: indexPlan,
  indexPlanList: indexPlanList,
  destroyPlan: destroyPlan,
  launchPlan: launchPlan,
  checkTeamJobTitle: checkTeamJobTitle,
  checkTeamFTEAdminPermission: checkTeamFTEAdminPermission,
  compareFTEToPlan: compareFTEToPlan
}
