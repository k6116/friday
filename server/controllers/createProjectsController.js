const models = require('../models/_index')
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;


function show(req, res) {

  const userID = req.params.userID;

  models.Projects.findAll({
    where: {createdBy: userID},
    attributes: ['id', 'projectName', 'description', 'notes'],
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
  const project = req.body;
  const userID = req.params.userID;

  const normalizedDate = new Date(Date.now()).toISOString();
  const today = new Date();

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

        const projectId = savedProject.id;
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
          projectTypeID: project.projectType,
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


function destroy(req, res) {

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


module.exports = {
  show: show,
  insert: insert,
  update: update,
  destroy: destroy
}