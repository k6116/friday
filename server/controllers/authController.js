
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const jwt = require('jsonwebtoken');
const moment = require('moment');
const momentTz = require('moment-timezone');
const _ = require('lodash');
const dotevnv = require('dotenv').config()
const fs = require('fs');
const path = require('path');
const Treeize = require('treeize');
const token = require('../token/token');
const logger = require('../logs/logs');
const bcryptjs = require('bcryptjs');

const tokenSecret = process.env.JWT_SECRET;  // get the secret code word for enconding and decoding the token with jwt
const expirationTime = 60 * 30  // set the token expiration time to 30 minutes - units are seconds: 60 (secs) * 60 (mins) * 24 (hrs) * 1 (days)

// TEMP CODE: testing websockets
var loggedInUsers = [];


function authenticate(req, res) {

  // get the user object from the request payload/body (user name and password)
  const user = req.body;
  
  models.User.findOne({
    where: {userName: user.userName}
  }).then(resUser => {
    // if a user object is returned, this indicates authentication success
    if (resUser) {

      // check if password is correct
      // if (bcryptjs.compare(user.password, resUser.password)) {

      employeeID = 1

      sequelize.query('SELECT * FROM auth_data(:employeeID)', {replacements: {employeeID: employeeID}, type: sequelize.QueryTypes.SELECT})
      .then(userData => {

        // treeize the data to get a nested object (for permissions)
        const userDataTree = new Treeize();
        userDataTree.grow(userData);
        const userDataTreeized = userDataTree.getData();

        // build a token using jwt
        const newToken = jwt.sign(
          {
            // userName: resUser.userName
            userData: userDataTreeized[0]
          }, 
          tokenSecret, 
          {expiresIn: expirationTime}
        );

        // decode the token to get the issued at and expiring at timestamps
        const decodedToken = token.decode(newToken, res);

        res.json({
          user: userDataTreeized[0],
          token: {
            signedToken: newToken,
            issuedAt: decodedToken.iat,
            expiringAt: decodedToken.exp
          },
          status: 200
        });
      })
    } else if (err) {
        // send a an error response (status code 500) indicating the credentials are invalid
        res.status(401).json({
          title: 'invalid user credentials',
          error: err
        });
    }
    
  })
  .catch(error => {
    res.status(401).json({
      title: 'invalid user credentials',
      error: {message: error}
    })

  });

}


// verify and decode the token to get user info, issued at and expiring at data
function getInfoFromToken(req, res) {

  const decodedToken = token.decode(req.header('X-Token'), res);

  // NOTE: the token is not updated here; only user data is returned from the decoded token
  res.json({
    user: decodedToken.userData,
    token: {
      signedToken: req.header('X-Token'),
      issuedAt: decodedToken.iat,
      expiringAt: decodedToken.exp
    }
  });

}


// function to get a new token and jarvis user
// NOTE: new jarvis user is retrived in case permissions or other details have changed
function resetToken(req, res) {

  const decodedToken = token.decode(req.header('X-Token'), res);

  employeeID = 1

  sequelize.query('SELECT * FROM auth_data(:employeeID)', {replacements: {employeeID: employeeID}, type: sequelize.QueryTypes.SELECT})
  .then(userData => {

    // treeize the data to get a nested object (for permissions)
    const userDataTree = new Treeize();
    userDataTree.grow(userData);
    const userDataTreeized = userDataTree.getData();

    // build a token using jwt
    const newToken = jwt.sign(
      {
        // userName: resUser.userName
        userData: userDataTreeized[0]
      }, 
      tokenSecret, 
      {expiresIn: expirationTime}
    );

    // decode the token to get the issued at and expiring at timestamps
    const decodedToken = token.decode(newToken, res);

    res.json({
      user: userDataTreeized[0],
      token: {
        signedToken: newToken,
        issuedAt: decodedToken.iat,
        expiringAt: decodedToken.exp
      },
      status: 200
    });
  
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });

}


// verify the user is able to access to app route (url)
function verifyRoutePermissions(req, res) {

  // get the token out of the request header
  const token = req.header('X-Token');
  // console.log('token:');
  // console.log(token);

  // get the path from the request header
  const path = req.header('X-Path');
  // console.log('path:');
  // console.log(path);

  // split the path into an array
  const pathArr = path.split('/');
  // console.log('path array:');
  // console.log(pathArr);

  // find the position of 'main' in the path
  const mainIndex = pathArr.indexOf('main');

  // get a string of the 'protected' route, which is everthing after the main route
  const protectedRoute = pathArr.slice(mainIndex + 1).join(' > ');
  // console.log('protected route:');
  // console.log(protectedRoute);

  // build the required permission string based on the path and permissions convention
  const permissionNeeded = `resources > ${protectedRoute} > view`;
  // console.log('permission needed:');
  // console.log(permissionNeeded);

  // send the token through verification and send the appropriate response
  jwt.verify(token, tokenSecret, (err, decoded) => {
    if (decoded) {

      // console.log('user permissions:');
      // console.log(decoded.userData.permissions);

      // try to find the required permission in the user's list of permissions
      const foundPermission = decoded.userData.permissions.find(permission => {
        // modify the permission string to replace white space between characters with '-' to match app routes and convert to lowercase
        const permissionNameModified = permission.permissionName.split(' > ').map(x => x.replace(/\s/g, '-')).join(' > ').toLowerCase();
        // console.log('permission modified:');
        // console.log(permissionNameModified);
        return permissionNeeded === permissionNameModified;
      });

      // console.log('found permission:');
      // console.log(foundPermission);

      // if the permission was found, return valid status code and token is valid true, otherwise return error status
      if (foundPermission) {
        res.status(200).json({
          tokenIsValid: true
        });
      } else {
        res.status(401).json({
          tokenIsValid: false
        });
      }

    // if the token is invalid, return error status
    } else {
      res.status(401).json({
        tokenIsValid: false
      });
    }
  })

}



function getLoginBackgroundImages(req, res) {

  var imagesDir = path.join(__dirname, '../../dist/assets/login_images');
  var metadataFile = path.join(__dirname, '../../dist/assets/login_images/_index.json');

  var metaData = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));

  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.log('could not read directory: ' + err);
    } else {
      res.json({
        files: files,
        images: metaData
      });
    }
  });

}


// get image file for login background
function getLoginImage(req, res) {

  var fileName = req.params.fileName;

  var options = {
    root: path.join(__dirname, '/../..', 'dist/assets/login_images'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

}


// TEMP CODE: testing websockets
function getLoggedInUsers(req, res) {

  console.log('getting logged in users for websockets testing (Whos logged in)');
  res.json(loggedInUsers);

}

// TEMP CODE: testing websockets
function logout(req, res) {

  var userName = req.params.userName;
  console.log(`user name: ${userName}`);

  _.remove(loggedInUsers, user => {
    return user.userName === userName;
  });

  // write entry to log file: user has logged out manually
  logger.writeLog('info', `user ${userName} has logged out`, {color: 'blue'});

  res.json(`user ${userName} has been removed from the array of logged in users`);

}

module.exports = {
  authenticate: authenticate,
  getInfoFromToken: getInfoFromToken,
  resetToken: resetToken,
  verifyRoutePermissions: verifyRoutePermissions,
  getLoggedInUsers: getLoggedInUsers,
  logout: logout,
  getLoginBackgroundImages: getLoginBackgroundImages,
  getLoginImage: getLoginImage
}
