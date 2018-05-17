const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');

// function getProjectAccessRequestsList(req, res) {

//   const userID = req.params.userID;

//   const sql = `
//   SELECT
//     P1.RequestID, P1.RequestStatus, P1.ProjectID, P1.RequestedBy, P1.RequestDate, P1.RequestNotes, P1.RespondedBy, P1.ResponseDate, P1.ResponseNotes,
//     P2.ProjectName, P2.CreatedBy,
//     E1.FullName
//   FROM
//     resources.ProjectAccessRequests P1
//     LEFT JOIN projects.Projects P2 ON P1.ProjectID = P2.ProjectID
//     LEFT JOIN accesscontrol.Employees E1 ON P1.RequestedBy = E1.EmployeeID
//   WHERE
//     P2.CreatedBy = '${userID}'
//   `
//   sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
//     .then(org => {
//       console.log("returning project access requests list");
//       res.json(org);
//     })
//     .catch(error => {
//       res.status(400).json({
//         title: 'Error (in catch)',
//         error: {message: error}
//       })
//     });
// }

function getProjectAccessRequestsList(req, res) {

  const userID = req.params.userID;

  models.ProjectAccessRequests.findAll({
    attributes: ['id', 'requestStatus', 'projectID', 'requestedBy', 'requestedAt', 'requestNotes'],
    raw: true,
    include: [
      {
        model: models.Projects,
        where: {createdBy: userID},
        attributes: ['id', 'projectName', 'createdBy'],
      },
      {
        model: models.User,
        attributes: ['id', 'fullName']
      }
  ]
  })
  .then(ProjectAccessRequests => {
    console.log('WORKED')
    res.json(ProjectAccessRequests);
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


function updateProjectAccessRequest(req, res) {

  // get the project object from the request body
  const request = req.body;
  const userID = req.params.userID;
  const reply = req.params.reply;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.ProjectAccessRequests
      .update(
        {
          requestStatus: reply,
          respondedBy: userID,
          respondedAt: today,
          responseNotes: 'Replied'
        },
        {
          where: {id: request.id},
          transaction: t
        }
      )
      .then(updateProjectAccessRequest => {

        console.log('Updated Project Access Request')
        console.log(updateProjectAccessRequest);

      })

    }).then(() => {

      res.json({
        message: `The requestID '${request.id}' has been updated successfully`
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
  getProjectAccessRequestsList: getProjectAccessRequestsList,
  insertProjectAccessRequest: insertProjectAccessRequest,
  updateProjectAccessRequest: updateProjectAccessRequest
}
