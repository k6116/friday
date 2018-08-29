const express = require('express');
const router = express.Router();
const app = express();
const jwt = require('jsonwebtoken');
const dotevnv = require('dotenv').config(
  {path: '/.env'}
);
const token = require('../token/token');

var controllers = require('../controllers/_index.js');

// TO-DO ALL: update per Security Confluence page

// AUTH CONTROLLER 
router.post('/auth/authenticate', controllers.auth.authenticate);
router.get('/auth/getLoginBackgroundImages', controllers.auth.getLoginBackgroundImages);
router.get('/auth/logout/:userName', controllers.auth.logout);  // TEMP CODE: for websockets

// CLICK TRACKING CONTROLLER
router.post('/clickTracking', controllers.clickTracking.insert);

// PROJECT CONTROLLER
router.get('/indexProjects', controllers.project.indexProjects)
router.get('/indexProjectsFilterProjectType', controllers.project.indexProjectsFilterProjectType)
router.get('/indexProjectRoster/:projectID', controllers.project.indexProjectRoster);
router.get('/indexUserProjectList/:userID', controllers.project.indexUserProjectList);
router.get('/indexProjectTypesList/', controllers.project.indexProjectTypesList);
router.get('/indexProjectStatusesList/', controllers.project.indexProjectStatusesList);
router.get('/indexProjectPrioritiesList/', controllers.project.indexProjectPrioritiesList);
router.post('/insertProject/:userID', controllers.project.insertProject);
router.post('/updateProject/:userID', controllers.project.updateProject);
router.post('/destroyProject/:userID', controllers.project.destroyProject);   // PROTECT
router.get('/indexProjectSchedule/:projectName', controllers.project.indexProjectSchedule);
router.get('/indexProjectTypeDisplayFields/', controllers.project.indexProjectTypeDisplayFields);
router.get('/indexBuildStatus', controllers.project.indexBuildStatus);
router.get('/indexPLCStatus', controllers.project.indexPLCStatus);
router.get('/indexProjectDepartments', controllers.project.indexProjectDepartments);
router.get('/indexProjectGroups', controllers.project.indexProjectGroups);
router.get('/indexProjectPriorities', controllers.project.indexProjectPriorities);
router.post('/updateProjectSetup/:userID', controllers.project.updateProjectSetup);
router.post('/insertProjectSetup/:userID', controllers.project.insertProjectSetup);
router.delete('/destroyProjectSetup/:projectID/:scheduleID/:userID', controllers.project.destroyProjectSetup);
router.post('/insertProjectEmployeeRole/:userID', controllers.project.insertProjectEmployeeRole);   // PROTECT
router.post('/updateProjectEmployeeRole/:userID', controllers.project.updateProjectEmployeeRole);   // PROTECT
router.post('/destroyProjectEmployeeRole/:userID', controllers.project.destroyProjectEmployeeRole);   // PROTECT
router.post('/insertBulkProjectEmployeeRole/:userID', controllers.project.insertBulkProjectEmployeeRole);   // PROTECT

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

// EMAIL CONTROLLER
router.post('/sendFTEReminder', controllers.email.sendFTEReminder);
router.post('/sendRequestProjectEmail/:userID/:ownerID/:projectName/:requestStatus', controllers.email.sendRequestProject); 
router.post('/sendProjectApprovalEmail/:userID/:ownerID/:projectName/:approved/:comment', controllers.email.sendProjectApproval);

// PERMISSION CONTROLLER
router.get('/indexPublicProjectTypes/:userID', controllers.permission.indexPublicProjectTypes);
router.get('/indexProjectPermissionRequestsList/:userID', controllers.permission.indexProjectPermissionRequestsList);
router.get('/indexProjectPermissionTeamList/:userID/:emailAddress/:managerEmailAddress', controllers.permission.indexProjectPermissionTeamList);
router.get('/indexProjectPermissionRequestedList/:userID', controllers.permission.indexProjectPermissionRequestedList);
router.post('/insertProjectPermissionRequest/:userID', controllers.permission.insertProjectPermissionRequest);
router.post('/updateProjectPermissionResponse/:userID/:reply/:replyComment', controllers.permission.updateProjectPermissionResponse);
router.post('/updateProjectPermissionRequest/:userID', controllers.permission.updateProjectPermissionRequest);

// REPORTS PROJECT CONTROLLER
router.get('/report/getSubordinateProjectRoster/:managerEmailAddress/:period', controllers.report.getSubordinateProjectRoster);
router.get('/report/getSubordinateFtes/:managerEmailAddress/:period', controllers.report.getSubordinateFtes);
router.get('/report/getMyFteSummary/:employeeID/:period', controllers.report.getMyFteSummary);
router.get('/report/getProjectFTEHistory/:projectID', controllers.report.getProjectFTEHistory);
router.get('/report/getProjectEmployeeFTEList/:projectID/:fiscalDate', controllers.report.getProjectEmployeeFTEList);
router.get('/getQuarterlyEmployeeFTETotals/:employeeID/:fiscalQuarter/:fiscalYear', controllers.report.getQuarterlyEmployeeFTETotals);

// ANALYTICS CONTROLLER
router.get('/getNCIProjectsParentChildList', controllers.analytics.getNCIProjectsParentChildList);
router.get('/getNCISupplyDemand/:projectName', controllers.analytics.getNCISupplyDemand);
router.get('/getNCISupplyDemandDatesList', controllers.analytics.getNCISupplyDemandDatesList);
router.get('/getNCISupplyDemandProjectList', controllers.analytics.getNCISupplyDemandProjectList);
router.get('/getNCISupplyDemandPartList/:projectName', controllers.analytics.getNCISupplyDemandPartList);
router.get('/getNCISupplyLotList/:partName', controllers.analytics.getNCISupplyLotList);
router.get('/getNCISupplyLotExclusionList/:partName', controllers.analytics.getNCISupplyLotExclusionList);
router.get('/execUpdateSupplyDemand/', controllers.analytics.execUpdateSupplyDemand);
router.post('/insertLotExclusion/:userID', controllers.analytics.insertLotExclusion);
router.post('/destroyLotExclusion/:userID', controllers.analytics.destroyLotExclusion);

// SCHEDULES CONTROLLER
router.post('/insertSchedule/:userID', controllers.schedules.insertSchedule);
router.post('/updateSchedule/:userID', controllers.schedules.updateSchedule);
router.post('/destroySchedule/:userID', controllers.schedules.destroySchedule);
router.post('/insertScheduleDetailBulk/:userID', controllers.schedules.insertScheduleDetailBulk);
router.post('/updateScheduleDetailBulk/:userID/:scheduleID', controllers.schedules.updateScheduleDetailBulk);


// middleware to return an error if the token cannot be verified
// if it is verified, it will continue (next) and allow the routes
// NOTE: all routes before this middleware function WILL NOT be protected in the case of invalid token
// NOTE: comment this out when you want to test routes using postman, chrome etc. without having to pass the token
router.use('/', function(req, res, next) {
  // get the token out of the query string and verify it is valid.
  jwt.verify(req.header('X-Token'), process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      // if the token was not decoded successfully, return an error status and message
      // which will block any routes below this
      return res.status(401).json({
        title: 'Not Authenticated',
        error: err
      });
    }
    console.log('token is valid, passed api guard');
    next();
  })
});


// AUTH CONTROLLER
router.get('/auth/websockets/index/getLoggedInUsers', controllers.auth.getLoggedInUsers);
router.get('/auth/getInfoFromToken', controllers.auth.getInfoFromToken);
router.post('/auth/resetToken', controllers.auth.resetToken);
router.get('/auth/verifyRoutePermissions', controllers.auth.verifyRoutePermissions);

// DASHBOARD CONTROLLER
router.get('/dashboard/dashboard/show/getFTEData/:startDate/:endDate', controllers.dashboard.getFTEData);
router.get('/dashboard/checkFirstLogin', controllers.dashboard.checkFirstLogin);
router.get('/dashboard/checkJobTitle', controllers.dashboard.checkJobTitle);
router.get('/dashboard/checkProjectRequests', controllers.dashboard.checkProjectRequests);

// JOB TITLE CONTROLLER (ADMIN)
router.get('/jobTitle/admin/index/indexJobTitle', controllers.jobTitle.indexJobTitle);
router.get('/jobTitle/admin/index/indexJobSubTitle', controllers.jobTitle.indexJobSubTitle);
router.put('/jobTitle/admin/update/updateEmployeeJobTitle', controllers.jobTitle.updateEmployeeJobTitle);

// FTE CONTROLLER
router.get('/fte/fte/index/indexUserData', controllers.fte.indexUserData);
router.delete('/fte/fte/destroy/destroyUserProject/:projectID', controllers.fte.destroyUserProject);   // PROTECT
router.put('/fte/fte/update/updateUserData', controllers.fte.updateUserData);

// TEMP JOB TITLE CONTROLLER
router.put('/jobTitle/admin/update/updateEmployeeJobTitle', controllers.jobTitle.updateEmployeeJobTitle);

// PROJECT CONTROLER
router.get('/project/displayProject/show/getProject/:projectID', controllers.project.getProject);

// SETUP PARTS
router.get('/getParts', controllers.parts.indexParts);
router.get('/getPart/:partID', controllers.parts.getPart);
router.get('/getPartTypes', controllers.parts.indexPartTypes);
router.post('/updatePart', controllers.parts.updatePart);
router.post('/createPart', controllers.parts.createPart);
router.delete('/deletePart/:partID/:scheduleID', controllers.parts.deletePart);

// SCHEDULES CONTROLLER
router.get('/getProjectSchedule/:projectID', controllers.schedules.indexProjectSchedule);
router.get('/getProjectSchedule2/:projectID', controllers.schedules.getProjectSchedule);
router.post('/updateProjectScheduleXML/:userID/:revisionNotes', controllers.schedules.updateProjectScheduleXML);
router.get('/getPartSchedule/:partID', controllers.schedules.indexPartSchedule);
router.post('/updatePartScheduleXML/:userID/:revisionNotes', controllers.schedules.updatePartScheduleXML); //TO-DO user Token for userID and put revisionNotes in header
router.get('/destroyScheduleSP/:scheduleID', controllers.schedules.destroyScheduleSP);



// middleware to protect permissions protected routes
// if it is verified, it will continue (next) and allow the routes
router.use('/', function(req, res, next) {

  // get the api route/path the user is attempting to access
  const path = req.path
  console.log('path');
  console.log(path);

  // decode the token to get access to the permission array
  const decodedToken = token.decode(req.header('X-Token'), res);
  // console.log('decoded token:');
  // console.log(decodedToken);

  // get the permissions within the token object (array of objects {permissionName: "name"})
  // NOTE: could slim down the token here by calling the db to get the permissions
  const permissions = decodedToken.userData.permissions;
  console.log('permissions array:');
  console.log(permissions);
  
  // translate the path into a string that should match the permission by applying the convention
  // split the path into an array
  const pathArr = path.split('/');
  console.log('path array:');
  console.log(pathArr);

  // build the required permission string based on the path and permissions convention
  const firstSegment = 'resources';
  const secondSegment = pathArr[2].split('-').join(' > ');
  var thirdSegment;
  if (pathArr[3] === 'index' || pathArr[3] === 'show') {
    thirdSegment = 'view';
  } else if (pathArr[3] === 'update') {
    thirdSegment = 'update';
  } else if (pathArr[3] === 'insert') {
    thirdSegment = 'create';
  } else if (pathArr[3] === 'destroy') {
    thirdSegment = 'delete';
  }
  const permissionNeeded = `${firstSegment} > ${secondSegment} > ${thirdSegment}`.toLowerCase();
  console.log('permission needed based on path:');
  console.log(permissionNeeded);

  // try to find the required permission in the user's list of permissions
  const foundPermission = permissions.find(permission => {
    // modify the permission string to remove white space between characters and convert to lowercase
    const permissionNameModified = permission.permissionName.split(' > ').map(x => x.replace(/\s/g, '')).join(' > ').toLowerCase();
    // console.log('permission modified');
    // console.log(permissionNameModified);
    return permissionNameModified === permissionNeeded;
  });
  console.log('found permission:');
  console.log(foundPermission);

  // if the permission was not found, send an error response
  if (!foundPermission) {
    console.log(`permission '${permissionNeeded}' not found, action is denied`);
    return res.status(401).json({
      title: 'Invalid Permissions',
      message: 'You do not have the appropriate permission to access the requested api route'
    });
  } 
  
  // otherwise, continue on and allow access to the routes below
  next();

});

// SETUPS MENU VIEW


// JOB TITLE CONTROLLER (ADMIN)
// router.put('/jobTitle/admin/update/updateEmployeeJobTitle', controllers.jobTitle.updateEmployeeJobTitle);
router.post('/jobTitle/admin/insert/insertJobTitle', controllers.jobTitle.insertJobTitle);
router.post('/jobTitle/admin/insert/insertJobSubTitle', controllers.jobTitle.insertJobSubTitle);
router.post('/jobTitle/admin/destroy/deleteJobTitle', controllers.jobTitle.deleteJobTitle);
router.post('/jobTitle/admin/destroy/deleteJobSubTitle', controllers.jobTitle.deleteJobSubTitle);
router.put('/jobTitle/admin/update/updateJobTitle', controllers.jobTitle.updateJobTitle);
router.put('/jobTitle/admin/update/updateJobSubTitle', controllers.jobTitle.updateJobSubTitle);
router.post('/jobTitle/admin/insert/insertJobTitleMap', controllers.jobTitle.insertJobTitleMap);
router.post('/jobTitle/admin/destroy/deleteJobTitleMap', controllers.jobTitle.deleteJobTitleMap);

// BOM CONTROLLER
router.get('/bom/bom/index', controllers.bom.index);
router.get('/bom/bom/show/showSingleBom/:parentID', controllers.bom.showSingleBom);
router.get('/bom/bom/show/showPartInfo/:partID', controllers.bom.showPartInfo);
router.get('/bom/bom/show/showProjectInfo/:projectID', controllers.bom.showProjectInfo);

// REPORT CONTROLLER
router.get('/report/reports-topProjects/show/getTopFTEProjectList', controllers.report.getTopFTEProjectList);
router.get('/report/reports-topProjectsBubble/show/getAggregatedFteData', controllers.report.getAggregatedFteData);


module.exports = router;
