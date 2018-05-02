const models = require('../models/_index')
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;


function show(req, res) {

  var userID = req.params.userID;

  models.Projects.findAll({
    where: {createdBy: userID},
    attributes: ['id', 'projectName', 'description'],
    raw: true,
    include: [{
      model: models.ProjectTypes,
      attributes: ['projectTypeName', 'description'],
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

function insert(req, res) {

  // get the project object from the request body
  var project = req.body;
  var normalizedDate = new Date(Date.now()).toISOString();
  var today = new Date();

  console.log('DATE');
  console.log(normalizedDate);

  // variable to hold the new list after delete, to send back in the response
  var newProjectList;

  return sequelize.transaction((t) => {

    return models.Projects
      .create(
        {
          projectName: project.projectName,
          projectTypeID: project.projectType,
          description: project.projectDescription,
          createdBy: 1,
          createdAt: today,
          updatedBy: 1,
          updatedAt: today
        },
        {
          transaction: t
        }
      )
      .then(savedProject => {

        var projectId = savedProject.id;
        console.log('created project id is: ' + projectId);

      })

    }).then(() => {

      res.json({
        message: `The project '${project.projectName}' has been added successfully`,
        projects: newProjectList
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}



function update(req, res) {

  // get the project object from the request body
  var project = req.body;
  var today = new Date();

  console.log('updating existing project:');
  console.log(project);

  return sequelize.transaction((t) => {

    return models.Projects
      .update(
        {
          projectName: project.projectName,
          projectTypeID: project.projectType,
          description: project.projectDescription,
          createdBy: 1,
          createdAt: today,
          updatedBy: 1,
          updatedAt: today
        },
        {
          where: {id: project.projectID},
          transaction: t
        }
      )
      .then(updatedTankReccordCount => {

        console.log('number of records updated in the tank table:')
        console.log(updatedTankReccordCount);

        // throw error for testing save confirm bar and other testing purposes
        // throw new Error();

        // delete all the existing records for this tank id
        return models.TankEfficiency
          .destroy(
            {
              where: {tankID: tank.tankID},
              transaction: t
            }
          )
          .then(deletedTankEfficiencies => {

            console.log('number of deleted records in the tankEfficiency table');
            console.log(deletedTankEfficiencies);

            // build an array of new tank efficiency records to add to the table
            var newTankEfficienciesArr = [];
            tank.tankEfficiencies.forEach(efficiency => {
              newTankEfficienciesArr.push({
                tankID: tank.tankID,
                equipmentType: efficiency.equipmentType,
                asf: efficiency.asf,
                efficiency: efficiency.efficiency / 100,
                ampMins: efficiency.ampMins,
                testDate: efficiency.testDate,
                comments: efficiency.comments,
                createdBy: 1,
                updatedBy: 1
              })
            })


            // insert the tank efficiency records into the table
            // no need for individualHooks since we don't need the generated primary keys
            return models.TankEfficiency
              .bulkCreate(
                newTankEfficienciesArr,
                {
                  transaction: t
                }
              )
              .then(newTankEfficiencies => {

                // filter down the tankEfficienciesHistory to only the records that have changed
                var tankEfficienciesHistoryArr = [];
                tank.tankEfficienciesHistory.forEach(efficiencyHistory => {
                  var found = tank.tankEfficiencies.find(efficiency => {
                    return _.isEqual(efficiencyHistory, efficiency)
                  });
                  if (!found) {
                    tankEfficienciesHistoryArr.push({
                      tankID: tank.tankID,
                      equipmentType: efficiencyHistory.equipmentType,
                      asf: efficiencyHistory.asf,
                      efficiency: efficiencyHistory.efficiency / 100,
                      ampMins: efficiencyHistory.ampMins,
                      testDate: efficiencyHistory.testDate,
                      comments: efficiencyHistory.comments,
                      createdBy: 1,
                      updatedBy: 1
                    });
                  }
                })
                console.log('data to insert into the efficiency history table');
                console.log(tankEfficienciesHistoryArr);

                // insert the tank efficiency records into the history table
                // no need for individualHooks since we don't need the generated primary keys
                return models.TankEfficiencyHistory
                  .bulkCreate(
                    tankEfficienciesHistoryArr,
                    {
                      transaction: t
                    }
                  )
                  .then(newTankEfficienciesHistory => {


                    console.log('we are done updating!')


                  })

              })

          })

      })

    }).then(() => {

      res.json({
        message: `The tank '${tank.tankNumber}' has been updated successfully`
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}


function destroy(req, res) {

  // get the tank id and tank number from the params
  var tankID = req.params.id;
  var tankNumber = req.params.number;

  // variable to hold the new list after delete, to send back in the response
  var newTanksList;

  console.log(`deleting tank with id: ${tankID} and tank number: ${tankNumber}`);

  return sequelize.transaction((t) => {

    return models.TankEfficiency
      .destroy(
        {
          where: {tankID: tankID},
          transaction: t
        }
      )
      .then(deletedRecordCount => {

        console.log('number of records deleted in the tankEfficiency table:')
        console.log(deletedRecordCount);

        return models.TankEfficiencyHistory
          .destroy(
            {
              where: {tankID: tankID},
              transaction: t
            }
          )
          .then(deletedRecordCount => {

            console.log('number of records deleted in the tankEfficiencyHistory table:')
            console.log(deletedRecordCount);

            // delete the record in the tank table
            return models.Tank
              .destroy(
                {
                  where: {id: tankID},
                  transaction: t
                }
              )
              .then(deletedRecordCount => {

                console.log('number of deleted records in the tank table');
                console.log(deletedRecordCount);

                // return a new list of tanks in the response to re-populate the combobox
                // this should yield better performance vs. making another request from the client side
                return models.Tank
                  .findAll(
                    {
                      attributes: ['id', 'tankNumber', 'tankType'],
                      order: ['id'],
                      transaction: t
                    }
                  )
                  .then(tanks => {

                    console.log('we are done deleting!')
                    newTanksList = tanks;

                  })

              })

          })

      })

    }).then(() => {

      res.json({
        message: `The tank '${tankNumber}' has been deleted successfully`,
        tanks: newTanksList
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
  show: show,
  insert: insert,
  update: update,
  destroy: destroy
}