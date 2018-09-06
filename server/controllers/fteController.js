
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
            planName: planName,
            projectID: data.projectID,
            employeeID: data.employeeID,
            fiscalDate: moment(data.month).format('YYYY-MM-DD') + 'T00:00:00.000Z',
            fte: +data.fte / 100, // convert the FTE value to a decimal
            createdBy: userID,
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            updatedBy: userID,
            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
          }
        )
      }
      // update array
      if (!data.newRecord && data.updated) {
        updateData.push({
          projectID: data.projectID,
          employeeID: data.employeeID,
          fiscalDate: moment(data.month).format('YYYY-MM-DD') + 'T00:00:00.000Z',
          fte: +data.fte / 100, // convert the FTE value to a decimal
          createdBy: userID,
          createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
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
    return models.ProjectEmployeePlanning
      .destroy({
        where: {
          id: deleteRecordIds
        },
        transaction: t
      })
      .then( deletedRows => {
        updatedValues.push(deletedRows);
        console.log(`${deletedRows} project employee records deleted`);

        return models.ProjectEmployeePlanning.bulkCreate(
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
            var newPromise = models.ProjectEmployeePlanning.update(
              {
                planName: planName,
                projectID: updateData[i].projectID,
                employeeID: updateData[i].employeeID,
                fiscalDate: moment.utc(updateData[i].fiscalDate).format(),
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

  sequelize.query('EXECUTE resources.ProjectEmployeesNewPlan :emailAddress, :userID, :planName', {replacements: {emailAddress: emailAddress, userID: userID, planName: planName}, type: sequelize.QueryTypes.SELECT})
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

  const userID = req.params.userID;
  const planName = req.params.planName;

  const sql = `
    SELECT
      PEP.PlanName as planName,
      P.ProjectID as projectID,
      P.ProjectName as projectName,
      PEP.ProjectEmployeesPlanningID as [allocations:recordID], -- Alias for Treeize
      E.FullName as [allocations:fullName], 
      PEP.EmployeeID as [allocations:employeeID],
      PEP.FiscalDate as [allocations:fiscalDate],
      PEP.FTE as [allocations:fte]
    FROM
      resources.ProjectEmployeesPlanning PEP
      LEFT JOIN accesscontrol.Employees E ON PEP.EmployeeID = E.EmployeeID
      LEFT JOIN projects.Projects P ON PEP.ProjectID = P.ProjectID
    WHERE
      PEP.PlanName = '${planName}' AND PEP.CreatedBy = ${userID}
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

  const userID = req.params.userID;

  const sql = `
    SELECT DISTINCT
      T1.PlanName as planName, MAX(T1.LastUpdateDate) as lastUpdateDate
    FROM
      resources.ProjectEmployeesPlanning T1
    WHERE
      T1.CreatedBy = ${userID}
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

  const userID = req.params.userID;
  const planName = req.params.planName;

  sequelize.query('EXECUTE resources.ProjectEmployeesLaunchPlan :userID, :planName', {replacements: {userID: userID, planName: planName}, type: sequelize.QueryTypes.SELECT})
  .then(results => {
    res.json({
      message: `Successfully launched plan "${planName}"`
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
  checkTeamJobTitle: checkTeamJobTitle
}
