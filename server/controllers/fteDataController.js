
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize')
const Treeize = require('treeize');
const moment = require('moment');
const Promise = require("bluebird");

function getFteData(req, res) {

    const userID = req.params.userID;
    sequelize.query('EXECUTE brcheung.DisplayFTE :userID', {replacements: {userID: userID}, type: sequelize.QueryTypes.SELECT})
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
  const updateIds = [];
  allFormData.forEach(data => {
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
  });


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

        // console.log('saved project employee records:')
        // console.log(savedProjectEmployees);

        // update the existing records
        // updateData.forEach((record, index) => {

        //   return models.ProjectEmployee.update(
        //     {
        //       projectID: record.projectID,
        //       employeeID: userID,
        //       fiscalDate: record.fiscalDate,
        //       fte: record.fte,
        //       updatedBy: userID,
        //       updatedAt: record.updatedAt
        //     },
        //     {
        //       where: { id: updateIds[index] }
        //     }
        //   )
        //   .then(updatedProjectEmployee => {
  
        //     console.log('project employee record updated')
            
        //   });
          
          // update the existing records
          return sequelize.transaction(function (t) {
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
              
              console.log('project employee records updated')
              
            });

          // });
         

        // })

        // // update the existing records
        // return models.ProjectEmployee.findAll({
        //   where: { id: { $in: updateIds } },
        //   transaction: t
        // })
        // .then(projectEmployees => {
        //   console.log('project employees to update:');
        //   console.log(projectEmployees);
        //   const updatePromises = projectEmployees.map(projectEmployee => {
        //     return projectEmployee.update(updateData);
        //   });
        //   console.log('updatePromises');
        //   console.log(updatePromises);
        //   return Promise.all(updatePromises)
        // })
        // .then(updatedProjectEmployees => {

          // console.log('updated project employee records:')
          // console.log(updatedProjectEmployees);

          console.log('we are done!')
          
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
