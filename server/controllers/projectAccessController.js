const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');

function getProjectAccessRequestsList(req, res) {

  const userID = req.params.userID;

  const sql = `
  SELECT
    P1.RequestID, P1.RequestStatus, P1.ProjectID, P1.RequestedBy, P1.RequestDate, P1.RequestNotes, P1.RespondedBy, P1.ResponseDate, P1.ResponseNotes,
    P2.ProjectName, P2.CreatedBy,
    E1.FullName
  FROM
    resources.ProjectAccessRequests P1
    LEFT JOIN projects.Projects P2 ON P1.ProjectID = P2.ProjectID
    LEFT JOIN accesscontrol.Employees E1 ON P1.RequestedBy = E1.EmployeeID
  WHERE
    P2.CreatedBy = '${userID}'
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(org => {
      console.log("returning project access requests list");
      res.json(org);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}


function insertProjectAccessRequest(req, res) {

  // get the project object from the request body
  const project = req.body;
  const userID = req.params.userID;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.ProjectAccessRequests
      .create(
        {
          requestStatus: 'Submitted',
          projectID: project.ProjectID,
          requestedBy: userID,
          requestedAt: today,
          requestNotes: 'Please give me access to add this project to my FTE'
        },
        {
          transaction: t
        }
      )
      .then(savedProjectAccessRequest => {

        const requestId = savedProjectAccessRequest.id;
        console.log('created request id is: ' + requestId);

      })

    }).then(() => {

      res.json({
        message: `The request for project '${project.ProjectName}' has been made successfully`,
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}


// function updateProject(req, res) {

//   // get the project object from the request body
//   const project = req.body;
//   const userID = req.params.userID;
//   const today = new Date();

//   console.log('updating existing project:');
//   console.log(project);

//   return sequelize.transaction((t) => {

//     return models.Projects
//       .update(
//         {
//           projectName: project.projectName,
//           projectTypeID: project.projectTypeID,
//           description: project.projectDescription,
//           createdBy: userID,
//           createdAt: today,
//           updatedBy: userID,
//           updatedAt: today
//         },
//         {
//           where: {id: project.projectID},
//           transaction: t
//         }
//       )
//       .then(updatedProject => {

//         console.log('Updated Project')
//         console.log(updatedProject);

//       })

//     }).then(() => {

//       res.json({
//         message: `The project '${project.projectName}' has been updated successfully`
//       })

//     }).catch(error => {

//       console.log(error);
//       res.status(500).json({
//         title: 'update failed',
//         error: {message: error}
//       });

//     })

// }


module.exports = {
  getProjectAccessRequestsList: getProjectAccessRequestsList,
  insertProjectAccessRequest: insertProjectAccessRequest,
  // updateProject: updateProject,
  // deleteProject: deleteProject,
}
