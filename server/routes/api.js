const express = require('express');
const router = express.Router();
const app = express();
const jwt = require('jsonwebtoken');

var controllers = require('../controllers/_index.js');

// AUTH CONTROLLER 
router.post('/login', controllers.auth.authenticate);
router.get('/getInfoFromToken', controllers.auth.getInfoFromToken);
router.post('/resetToken', controllers.auth.resetToken);

// FTE data controller
router.get('/ftedata/:userID', controllers.fteData.getFteData);
router.post('/ftedata/:userID', controllers.fteData.update);
router.post('/ftedata/deleteProject/:userID', controllers.fteData.deleteProject);

// PROJECT CONTROLLER
router.get('/getProjectRoster/:projectID', controllers.project.getProjectRoster);
router.get('/getUserPLMData/:userEmailAddress', controllers.project.getUserPLMData);
// router.get('/projects/projectlist', controllers.projectSelector.getProjectList);
router.get('/getProjectTypesList/', controllers.project.getProjectTypesList);
router.get('/getPrimaryKeyRefs/:pKeyName/:pKeyValue/:userID', controllers.project.getPrimaryKeyRefs);
router.get('/getUserProjectList/:userID', controllers.project.getUserProjectList);
router.post('/createProject/:userID', controllers.project.insertProject);
router.post('/updateProject/:userID', controllers.project.updateProject);
router.post('/deleteProject/:userID', controllers.project.deleteProject);

// ORG TREE DATA
router.get('/employeeList/:managerEmailAddress', controllers.employeeList.show);

// ORG CONTROLLER
router.get('/org/:emailAddress', controllers.org.show);
router.get('/projects', controllers.project.getAll)

// CLICK TRACKING CONTROLLER
router.post('/clickTracking/:userID', controllers.clickTracking.insert);

// EMAIL CONTROLLER
router.post('/sendFTEReminder', controllers.email.sendFTEReminder);
router.post('/sendRequestProjectEmail/:userID/:ownerID/:projectName', controllers.email.sendRequestProject); 
router.post('/sendProjectApprovalEmail/:userID/:ownerID/:projectName', controllers.email.sendProjectApproval);

//PROJECT ACCESS CONTROLLER
router.get('/getProjectAccessRequestsList/:userID', controllers.projectAccess.getProjectAccessRequestsList);
router.get('/getProjectAccessTeamList/:userID/:managerEmailAddress', controllers.projectAccess.getProjectAccessTeamList);
router.get('/getProjectAccessList/:userID', controllers.projectAccess.getProjectAccessList);
router.get('/getPublicProjectTypes/:userID', controllers.projectAccess.getPublicProjectTypes);
router.post('/submitProjectAccessRequest/:userID', controllers.projectAccess.insertProjectAccessRequest);
router.post('/responseProjectAccessRequest/:userID/:reply', controllers.projectAccess.updateProjectAccessRequest);

// Profile Controller
router.get('/getJobTitleList', controllers.profile.show);
router.post('/updateProfile/:userID', controllers.profile.update);
// router.get('/getJobTitle/:jobTitleID', controllers.profile.show2);

// NOTE: all routes before this middleware function WILL NOT be protected in the case of invalid token

// middleware to return an error if the token cannot be verified
// if it is verified, it will continue (next) and allow the routes
// NOTE: comment this out when you want to test routes using postman, chrome etc. without having to pass the token
router.use('/', function(req, res, next) {
  // get the token out of the query string and verify it is valid.
  jwt.verify(req.query.token, 'rutabega', (err, decoded) => {
    if (err) {
      console.log(err);
      // if the token was not decoded successfully, return an error status and message
      // which will block any routes below this
      return res.status(401).json({
        title: 'Not Authenticated',
        error: err
      });
    } else {
      console.log('token is valid, passed api guard');
    }
    next();
  })
});

// NOTE: all routes after this middleware function WILL be protected in the case of invalid token

router.get('/users', controllers.auth.index);



module.exports = router;
