const sequelize = require('../db/sequelize').sequelize;
const Op = sequelize.Op;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');


// Retreive the ProjectTypes that do not require Permission and are accessible to all users
function indexPublicProjectTypes(req, res) {

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

// Retrieve list of all projects created by current user in project Permission list
function indexProjectPermissionRequestsList(req, res) {

  const userID = req.params.userID;

  models.ProjectPermissionRequests.findAll({
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
  .then(ProjectPermissionRequests => {
    console.log('WORKED')
    res.json(ProjectPermissionRequests);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}

// Retrieve list of all projects that are created by employees under the same manager for current user
// This list is used to give default Permission to team member's projects
function indexProjectPermissionTeamList(req, res) {

  const managerEmailAddress = req.params.managerEmailAddress;
  const userID = req.params.userID;

  // models.Projects.findAll({
  //   where: 
  //     {
  //       [Op.or]: [{projectOrgManager: managerEmailAddress}, {createdBy: userID}]
  //     },
  //   attributes: ['id', 'projectName'],
  // })
  // .then(ProjectPermissionTeamList => {
  //   console.log('returning project permission team list')
  //   res.json(ProjectPermissionTeamList);
  // })
  // .catch(error => {
  //   res.status(400).json({
  //     title: 'Error (in catch)',
  //     error: {message: error}
  //   })
  // });

  const sql = `
    SELECT
      P.ProjectID as id, P.ProjectName as projectName, E.EmailAddress as emailAddress
    FROM
      projects.Projects P
      LEFT JOIN accesscontrol.Employees E ON P.CreatedBy = E.EmployeeID
    WHERE
      P.ProjectOrgManager = '${managerEmailAddress}' OR P.CreatedBy = ${userID} OR E.EmailAddress = '${managerEmailAddress}'
  `
  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(indexProjectPermissionTeamList => {
      console.log("returning project permission team list");
      res.json(indexProjectPermissionTeamList);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });
    
}

// Retrieve list of all project Permission requests made by current user
function indexProjectPermissionRequestedList(req, res) {

  const userID = req.params.userID;

  models.ProjectPermissionRequests.findAll({
    where: {requestedBy: userID},
    attributes: ['id', 'requestStatus', 'projectID', 'requestedBy', 'requestedAt', 'requestNotes', 'respondedBy', 'respondedAt', 'responseNotes'],
  })
  .then(ProjectPermissionList => {
    console.log('WORKED')
    res.json(ProjectPermissionList);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })

  });
}

function insertProjectPermissionRequest(req, res) {

  // get the project object from the request body
  const project = req.body;
  const userID = req.params.userID;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.ProjectPermissionRequests
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
      .then(savedProjectPermissionRequest => {

        const requestId = savedProjectPermissionRequest.id;
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


function updateProjectPermissionResponse(req, res) {

  // get the project object from the request body
  const requestData = req.body;
  const userID = req.params.userID;
  const reply = req.params.reply;
  const replyComment = req.params.replyComment;
  const today = new Date();

  return sequelize.transaction((t) => {

    return models.ProjectPermissionRequests
      .update(
        {
          requestStatus: reply,
          respondedBy: userID,
          respondedAt: today,
          responseNotes: replyComment,
        },
        {
          where: {id: requestData.id},
          transaction: t
        }
      )
      .then(updateProjectPermissionResponse => {

        console.log('Updated Project Access Response')
        console.log(updateProjectPermissionResponse);

      })

    }).then(() => {

      res.json({
        message: `The requestID '${requestData.id}' has been updated successfully`
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}

function updateProjectPermissionRequest(req, res) {

  // get the project object from the request body
  const requestData = req.body;
  const today = new Date();

  console.log(requestData.requestID);

  return sequelize.transaction((t) => {

    return models.ProjectPermissionRequests
      .update(
        {
          requestStatus: requestData.requestStatus,
          requestedAt: today,
          requestNotes: requestData.requestNotes,
          respondedBy: null,
          respondedAt: null,
          responseNotes: null,
        },
        {
          where: {id: requestData.requestID},
          transaction: t
        }
      )
      .then(updateProjectPermissionRequest => {

        console.log('Updated Project Access Request')
        console.log(updateProjectPermissionRequest);

      })

    }).then(() => {

      res.json({
        message: `The requestID '${requestData.requestID}' has been updated successfully`
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
  indexPublicProjectTypes: indexPublicProjectTypes,
  indexProjectPermissionRequestsList: indexProjectPermissionRequestsList,
  indexProjectPermissionTeamList: indexProjectPermissionTeamList,
  indexProjectPermissionRequestedList: indexProjectPermissionRequestedList,
  insertProjectPermissionRequest: insertProjectPermissionRequest,
  updateProjectPermissionResponse: updateProjectPermissionResponse,
  updateProjectPermissionRequest: updateProjectPermissionRequest
}
