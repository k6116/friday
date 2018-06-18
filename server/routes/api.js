const express = require('express');
const router = express.Router();
const app = express();
const jwt = require('jsonwebtoken');

var controllers = require('../controllers/_index.js');

// TO-DO ALL: rename controller functions to index, show, insert, update, destory if it fits

// AUTH CONTROLLER 
router.post('/login', controllers.auth.authenticate);
router.get('/getInfoFromToken', controllers.auth.getInfoFromToken);
router.post('/resetToken', controllers.auth.resetToken);
router.get('/getLoggedInUsers', controllers.auth.getLoggedInUsers);
router.get('/logout/:userName', controllers.auth.logout);

// FTE CONTROLLER
router.get('/fte/indexUserData/:userID', controllers.fte.indexUserData);
router.delete('/fte/destroyUserProject/:userID', controllers.fte.destroyUserProject);
router.post('/fte/updateUserData/:userID', controllers.fte.updateUserData);

// PROJECT CONTROLLER
router.get('/projects', controllers.project.getAll)
router.get('/getProjectRoster/:projectID', controllers.project.getProjectRoster);
router.get('/getUserPLMData/:userEmailAddress', controllers.project.getUserPLMData);
router.get('/getProjectTypesList/', controllers.project.getProjectTypesList);
router.get('/getPrimaryKeyRefs/:pKeyName/:pKeyValue/:userID', controllers.project.getPrimaryKeyRefs);
router.get('/getUserProjectList/:userID', controllers.project.getUserProjectList);
router.post('/createProject/:userID', controllers.project.insertProject);
router.post('/updateProject/:userID', controllers.project.updateProject);
router.post('/deleteProject/:userID', controllers.project.deleteProject);
router.get('/getProjectSchedule/:projectName', controllers.project.getProjectSchedule);
router.get('/getProjectTypeDisplayFields/', controllers.project.getProjectTypeDisplayFields);
router.get('/getProjectRoles/', controllers.project.getProjectRoles);
router.get('/getUserProjectRoles/:userID', controllers.project.getUserProjectRoles);
router.post('/insertProjectEmployeeRole/:userID', controllers.project.insertProjectEmployeeRole);
router.post('/updateProjectEmployeeRole/:userID', controllers.project.updateProjectEmployeeRole);


// EMPLOYEE CONTROLLER
router.get('/employeeList/:managerEmailAddress', controllers.employee.show);

// ORG CONTROLLER
router.get('/org/subordinatesFlat/:emailAddress', controllers.org.getSubordinatesFlat);
router.get('/org/:emailAddress', controllers.org.show);

// CLICK TRACKING CONTROLLER
router.post('/clickTracking/:userID', controllers.clickTracking.insert);

// EMAIL CONTROLLER
router.post('/sendFTEReminder', controllers.email.sendFTEReminder);
router.post('/sendRequestProjectEmail/:userID/:ownerID/:projectName', controllers.email.sendRequestProject); 
router.post('/sendProjectApprovalEmail/:userID/:ownerID/:projectName/:approved/:comment', controllers.email.sendProjectApproval);

// PROJECT ACCESS CONTROLLER
router.get('/getProjectAccessRequestsList/:userID', controllers.projectAccess.getProjectAccessRequestsList);
router.get('/getProjectAccessTeamList/:userID/:managerEmailAddress', controllers.projectAccess.getProjectAccessTeamList);
router.get('/getProjectAccessList/:userID', controllers.projectAccess.getProjectAccessList);
router.get('/getPublicProjectTypes/:userID', controllers.projectAccess.getPublicProjectTypes);
router.post('/submitProjectAccessRequest/:userID', controllers.projectAccess.insertProjectAccessRequest);
router.post('/responseProjectAccessRequest/:userID/:reply/:replyComment', controllers.projectAccess.responseProjectAccessRequest);
router.post('/updateProjectAccessRequest/:userID', controllers.projectAccess.updateProjectAccessRequest);

// PROFILE CONTROLLER
router.get('/getJobTitleList', controllers.profile.show);
router.post('/updateProfile/:userID', controllers.profile.update);
router.post('/insertJobTitle', controllers.profile.insertJobTitle);
// router.get('/getJobTitle/:jobTitleID', controllers.profile.show2);

// REPORTS PROJECT CONTROLLER
router.get('/report/getSubordinateProjectRoster/:managerEmailAddress/:period', controllers.report.getSubordinateProjectRoster);
router.get('/report/getSubordinateFtes/:managerEmailAddress/:period', controllers.report.getSubordinateFtes);
router.get('/report/getAggregatedFteData', controllers.report.getAggregatedFteData);
router.get('/report/getMyFteSummary/:employeeID/:period', controllers.report.getMyFteSummary);
router.get('/report/getProjectFTEHistory/:projectID', controllers.report.getProjectFTEHistory);
router.get('/report/getTopFTEProjectList/', controllers.report.getTopFTEProjectList);
router.get('/report/getProjectEmployeeFTEList/:projectID/:fiscalDate', controllers.report.getProjectEmployeeFTEList);
router.get('/getQuarterlyEmployeeFTETotals/:employeeID/:fiscalQuarter/:fiscalYear', controllers.report.getQuarterlyEmployeeFTETotals);

// NOTE: all routes before this middleware function WILL NOT be protected in the case of invalid token

// middleware to return an error if the token cannot be verified
// if it is verified, it will continue (next) and allow the routes
// NOTE: comment this out when you want to test routes using postman, chrome etc. without having to pass the token
// TO-DO BILL: pull in the token secret from .env
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
