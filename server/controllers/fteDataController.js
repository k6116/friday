
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


function update(req, res) {

  const formData = req.body;
  const userID = req.params.userID;

  console.log('form data:');
  console.log(formData);

  // combine all project arrays into a single array
  const allFormData = [];
  formData.forEach(projectArr => {
    allFormData.push(...projectArr);
  });
  console.log('combined form data:');
  console.log(allFormData);

  // build arrays of objects for insert and update
  const insertData = [];
  const updateData = [];
  const deleteIds = [];
  const updateIds = [];
  allFormData.forEach(data => {
    // if data needs to be deleted, parse into delete array
    if (data.toBeDeleted) {
      deleteIds.push(data.recordID);
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

  console.log('ids for deletion');
  console.log(deleteIds);
  console.log('data to insert');
  console.log(insertData);
  console.log('data to update');
  console.log(updateData);
  console.log('ids for update');
  console.log(updateIds);


  return sequelize.transaction((t) => {

    // insert the new records
    return models.ProjectEmployee
      .bulkCreate(
        insertData,
        {transaction: t}
      )
      .then(savedProjectEmployees => {

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
          
          console.log(`${updatedProjectEmployee.length} project employee records updated`);
          
        });
          
      })

    }).then(() => {

      res.json({
        message: `The FTEs have been inserted and updated successfully`,
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
    getFteData: getFteData,
    update: update
}
