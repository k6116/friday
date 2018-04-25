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

// project list data
router.get('/projects/projectlist', controllers.projectSelector.getProjectList);

// ORG TREE DATA
router.get('/employeeList/:managerEmailAddress', controllers.employeeList.show);

// ORG CONTROLLER
router.get('/org/:emailAddress', controllers.org.show);
router.get('/projects', controllers.project.getAll)

// CLICK TRACKING CONTROLLER
router.post('/clickTracking/:userID', controllers.clickTracking.insert);

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
