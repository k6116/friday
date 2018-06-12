const sequelize = require('../db/sequelize').sequelize;
const Op = sequelize.Op;
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


function getPublicProjectTypes(req, res) {

  const userID = req.params.userID;

  const sql = `
  SELECT
    T1.LookupID, T1.LookupName, T1.LookupValue
  FROM
    other.Lookups T1
  WHERE
    T1.LookupName = 'Public Project Type'
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(publicProjectTypes => {
      console.log("returning public project types");
      res.json(publicProjectTypes);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
}

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

function getProjectAccessTeamList(req, res) {

  const managerEmailAddress = req.params.managerEmailAddress;
  const userID = req.params.userID;

  models.Projects.findAll({
    where: 
    // {projectOrgManager: managerEmailAddress},
      {
        [Op.or]: [{projectOrgManager: managerEmailAddress}, {createdBy: userID}]
      },
    attributes: ['id', 'projectName'],
  })
  .then(ProjectAccessTeamList => {
    console.log('WORKED')
    res.json(ProjectAccessTeamList);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}

function getProjectAccessList(req, res) {

  const userID = req.params.userID;

  models.ProjectAccessRequests.findAll({
    where: {requestedBy: userID},
    attributes: ['id', 'requestStatus', 'projectID', 'requestedBy', 'requestedAt', 'requestNotes', 'respondedBy', 'respondedAt', 'responseNotes'],
  })
  .then(ProjectAccessList => {
    console.log('WORKED')
    res.json(ProjectAccessList);
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


function responseProjectAccessRequest(req, res) {

  // get the project object from the request body
  const request = req.body;
  const userID = req.params.userID;
  const reply = req.params.reply;
  const replyComment = req.params.replyComment;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.ProjectAccessRequests
      .update(
        {
          requestStatus: reply,
          respondedBy: userID,
          respondedAt: today,
          responseNotes: replyComment,
        },
        {
          where: {id: request.id},
          transaction: t
        }
      )
      .then(responseProjectAccessRequest => {

        console.log('Updated Project Access Response')
        console.log(responseProjectAccessRequest);

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

function updateProjectAccessRequest(req, res) {

  // get the project object from the request body
  const projectData = req.body;
  const userID = req.params.userID;
  const action = req.params.action;
  const actionComment = req.params.actionComment;
  const today = new Date();

  console.log(projectData);

  return sequelize.transaction((t) => {

    return models.ProjectAccessRequests
      .update(
        {
          requestStatus: action,
          requestedAt: today,
          requestNotes: actionComment,
          respondedBy: null,
          respondedAt: null,
          responseNotes: null,
        },
        {
          where: {id: projectData.requestID},
          transaction: t
        }
      )
      .then(updateProjectAccessRequest => {

        console.log('Updated Project Access Request')
        console.log(updateProjectAccessRequest);

      })

    }).then(() => {

      res.json({
        message: `The requestID '${projectData.requestID}' has been updated successfully`
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
  getPublicProjectTypes: getPublicProjectTypes,
  getProjectAccessRequestsList: getProjectAccessRequestsList,
  getProjectAccessTeamList: getProjectAccessTeamList,
  getProjectAccessList: getProjectAccessList,
  insertProjectAccessRequest: insertProjectAccessRequest,
  responseProjectAccessRequest: responseProjectAccessRequest,
  updateProjectAccessRequest: updateProjectAccessRequest
}
