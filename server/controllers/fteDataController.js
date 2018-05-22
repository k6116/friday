
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize')
const Treeize = require('treeize');
const moment = require('moment');


function getFteData(req, res) {

    const userID = req.params.userID;
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

function deleteProject(req, res) {
  const userID = req.params.userID;
  const toBeDeletedID = req.body.projectID;
  const toBeDeletedName = req.body.projectName;
  return models.ProjectEmployee
  .destroy({
    where: {
      projectID: toBeDeletedID,
      employeeID: userID
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

function update(req, res) {

  const formData = req.body;
  const userID = req.params.userID;
  const updatedValues = [];

  // console.log('form data:');
  // console.log(formData);

  // combine all project arrays into a single array
  const allFormData = [];
  formData.forEach(projectArr => {
    allFormData.push(...projectArr);
  });
  // console.log('combined form data:');
  // console.log(allFormData);

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
            fte: +data.fte,
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
          fte: +data.fte,
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

module.exports = {
    getFteData: getFteData,
    update: update,
    deleteProject: deleteProject
}
