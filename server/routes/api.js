const express = require('express');
const router = express.Router();
const app = express();
const jwt = require('jsonwebtoken');
const dotevnv = require('dotenv').config(
  {path: '/.env'}
);

var controllers = require('../controllers/_index.js');

// TO-DO ALL: rename controller functions to index, show, insert, update, destory if it fits

// AUTH CONTROLLER 
router.post('/login', controllers.auth.authenticate);
router.get('/getInfoFromToken', controllers.auth.getInfoFromToken);
router.post('/resetToken', controllers.auth.resetToken);
router.get('/getLoggedInUsers', controllers.auth.getLoggedInUsers);
router.get('/logout/:userName', controllers.auth.logout);
router.get('/getLoginBackgroundImages', controllers.auth.getLoginBackgroundImages);

// FTE CONTROLLER
router.get('/fte/indexUserData/:userID', controllers.fte.indexUserData);
router.post('/fte/destroyUserProject/:userID', controllers.fte.destroyUserProject);
router.post('/fte/updateUserData/:userID', controllers.fte.updateUserData);

// PROJECT CONTROLLER
router.get('/indexProjects', controllers.project.indexProjects)
router.get('/indexProjectsFilterProjectType', controllers.project.indexProjectsFilterProjectType)
router.get('/indexProjectRoster/:projectID', controllers.project.indexProjectRoster);
router.get('/indexUserProjectList/:userID', controllers.project.indexUserProjectList);
router.get('/indexProjectTypesList/', controllers.project.indexProjectTypesList);
router.post('/insertProject/:userID', controllers.project.insertProject);
router.post('/updateProject/:userID', controllers.project.updateProject);
router.post('/destroyProject/:userID', controllers.project.destroyProject);
router.get('/indexProjectSchedule/:projectName', controllers.project.indexProjectSchedule);
router.get('/indexProjectTypeDisplayFields/', controllers.project.indexProjectTypeDisplayFields);
router.post('/insertProjectEmployeeRole/:userID', controllers.project.insertProjectEmployeeRole);
router.post('/updateProjectEmployeeRole/:userID', controllers.project.updateProjectEmployeeRole);
router.post('/destroyProjectEmployeeRole/:userID', controllers.project.destroyProjectEmployeeRole);
router.post('/insertBulkProjectEmployeeRole/:userID', controllers.project.insertBulkProjectEmployeeRole);
router.get('/indexBuildStatus', controllers.project.indexBuildStatus);

// META DATA CONTROLLER
router.get('/indexPrimaryKeyRefs/:pKeyName/:pKeyValue/:userID', controllers.metaData.indexPrimaryKeyRefs);

// EMPLOYEE CONTROLLER
router.get('/employeeList/:managerEmailAddress', controllers.employee.show);
router.get('/showUserPLMData/:userEmailAddress', controllers.employee.showUserPLMData);
router.get('/getDesigners', controllers.employee.getDesigners);
router.get('/getPlanners', controllers.employee.getPlanners);

// ORG CONTROLLER
router.get('/org/subordinatesFlat/:emailAddress', controllers.org.getSubordinatesFlat);
router.get('/org/:emailAddress', controllers.org.show);

// CLICK TRACKING CONTROLLER
router.post('/clickTracking/:userID', controllers.clickTracking.insert);

// EMAIL CONTROLLER
router.post('/sendFTEReminder', controllers.email.sendFTEReminder);
router.post('/sendRequestProjectEmail/:userID/:ownerID/:projectName', controllers.email.sendRequestProject); 
router.post('/sendProjectApprovalEmail/:userID/:ownerID/:projectName/:approved/:comment', controllers.email.sendProjectApproval);

// PERMISSION CONTROLLER
router.get('/indexPublicProjectTypes/:userID', controllers.permission.indexPublicProjectTypes);
router.get('/indexProjectPermissionRequestsList/:userID', controllers.permission.indexProjectPermissionRequestsList);
router.get('/indexProjectPermissionTeamList/:userID/:managerEmailAddress', controllers.permission.indexProjectPermissionTeamList);
router.get('/indexProjectPermissionRequestedList/:userID', controllers.permission.indexProjectPermissionRequestedList);
router.post('/insertProjectPermissionRequest/:userID', controllers.permission.insertProjectPermissionRequest);
router.post('/updateProjectPermissionResponse/:userID/:reply/:replyComment', controllers.permission.updateProjectPermissionResponse);
router.post('/updateProjectPermissionRequest/:userID', controllers.permission.updateProjectPermissionRequest);

// JOB TITLE CONTROLLER
router.get('/indexJobTitle', controllers.jobTitle.indexJobTitle);
router.get('/indexJobSubTitle', controllers.jobTitle.indexJobSubTitle);
router.post('/updateEmployeeJobTitle/:userID', controllers.jobTitle.updateEmployeeJobTitle);
router.post('/insertJobTitle', controllers.jobTitle.insertJobTitle);
router.post('/deleteJobTitle', controllers.jobTitle.deleteJobTitle);
router.post('/updateJobTitle', controllers.jobTitle.updateJobTitle);
router.post('/insertJobSubTitle', controllers.jobTitle.insertJobSubTitle);
router.post('/deleteJobSubTitle', controllers.jobTitle.deleteJobSubTitle);
router.post('/updateJobSubTitle', controllers.jobTitle.updateJobSubTitle);
router.post('/insertJobTitleMap', controllers.jobTitle.insertJobTitleMap);
router.post('/deleteJobTitleMap', controllers.jobTitle.deleteJobTitleMap);

// REPORTS PROJECT CONTROLLER
router.get('/report/getSubordinateProjectRoster/:managerEmailAddress/:period', controllers.report.getSubordinateProjectRoster);
router.get('/report/getSubordinateFtes/:managerEmailAddress/:period', controllers.report.getSubordinateFtes);
router.get('/report/getAggregatedFteData', controllers.report.getAggregatedFteData);
router.get('/report/getMyFteSummary/:employeeID/:period', controllers.report.getMyFteSummary);
router.get('/report/getProjectFTEHistory/:projectID', controllers.report.getProjectFTEHistory);
router.get('/report/getTopFTEProjectList/', controllers.report.getTopFTEProjectList);
router.get('/report/getProjectEmployeeFTEList/:projectID/:fiscalDate', controllers.report.getProjectEmployeeFTEList);
router.get('/getQuarterlyEmployeeFTETotals/:employeeID/:fiscalQuarter/:fiscalYear', controllers.report.getQuarterlyEmployeeFTETotals);

// SCHEDULES CONTROLLER
router.get('/indexSchedules', controllers.schedules.indexSchedules);
router.get('/getPartSchedule/:partID', controllers.schedules.getPartSchedule);


// PARTS CONTROLLER
router.get('/getParts', controllers.parts.indexParts);
router.get('/getPart/:partID', controllers.parts.getPart);
router.get('/getPartTypes', controllers.parts.indexPartTypes);


// DASHBOARD CONTROLLER
router.get('/dashboard/getFTEData/:emailAddress/:startDate/:endDate', controllers.dashboard.getFTEData);
router.get('/dashboard/checkFirstLogin/:employeeID/:userName', controllers.dashboard.checkFirstLogin);
router.get('/dashboard/checkJobTitle/:employeeID', controllers.dashboard.checkJobTitle);
router.get('/dashboard/checkProjectRequests/:employeeID', controllers.dashboard.checkProjectRequests);


// NOTE: all routes before this middleware function WILL NOT be protected in the case of invalid token

// middleware to return an error if the token cannot be verified
// if it is verified, it will continue (next) and allow the routes
// NOTE: comment this out when you want to test routes using postman, chrome etc. without having to pass the token
// TO-DO BILL: pull in the token secret from .env
router.use('/', function(req, res, next) {
  // get the token out of the query string and verify it is valid.
  jwt.verify(req.query.token, process.env.JWT_SECRET, (err, decoded) => {
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
