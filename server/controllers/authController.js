
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const ldapAuth = require('ldapAuth-fork');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const momentTz = require('moment-timezone');
const _ = require('lodash');
const dotevnv = require('dotenv').config()
const fs = require('fs');
const path = require('path');
const Treeize = require('treeize');
const token = require('../token/token');

const tokenSecret = process.env.JWT_SECRET;  // get the secret code word for enconding and decoding the token with jwt
const expirationTime = 60 * 30  // set the token expiration time to 30 minutes - units are seconds: 60 (secs) * 60 (mins) * 24 (hrs) * 1 (days)

// TEMP CODE: testing websockets
 var loggedInUsers = [];


function authenticate(req, res) {

  // get the user object from the request payload/body (user name and password)
  const user = req.body;

  // set the ldap options object
  const options = {
    url: 'ldap://adldap.cos.is.keysight.com',
    bindDN: `cn=${user.userName},cn=users,dc=ad,dc=keysight,dc=com`,
    bindCredentials: user.password,
    searchBase: 'dc=ad,dc=keysight,dc=com',
    searchFilter: '(cn={{username}})'
  };
  
  // create an instance of the ldap auth fork 
  const auth = new ldapAuth(options);

  // TO-DO: figure out what this is for
  auth.on('error', (err) => {
    console.log('error on authentication:');
    console.error(err);
  });

  // start a timer to check the performance of the ldap server
  const startTime = process.hrtime();
  
  // call the authenticate method (ldapAuth-fork) on the auth object, passing in the user name and password
  auth.authenticate(user.userName, user.password, (err, ldapUser) => {
    // if a user object is returned, this indicates authentication success
    if (ldapUser) {
      // double check by making sure the user name matches
      if (ldapUser.cn === user.userName) {

        // log the ldap response time
	      const timeDiff = process.hrtime(startTime);
        console.log("ldap response took: " + (timeDiff[1] / 1e6) + " milliseconds.")
        
        // set variables using the ldap object
        let userName = ldapUser.cn;
        let emailAddress = ldapUser.mail;
        let fullName = ldapUser.givenName + ' ' + ldapUser.sn.replace(/\w\S*/g, text => {
          return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        });
        const nameArr = fullName.split(' ');
        let firstName = nameArr[0];
        let lastName = nameArr[nameArr.length - 1];

        // TEMP CODE: impersonate as a manager for testing
        // userName = 'ethanh';
        // emailAddress = 'ethan_hunt@keysight.com';
        // fullName = 'Ethan Hunt';
        // firstName = 'Ethan';
        // lastName = 'Hunt'

        // execute the stored procedure to get the user data, role, and permissions
        // it will also insert a new record into the employees table if this is a new user
        sequelize.query('EXECUTE resources.AuthData :emailAddress, :firstName, :lastName, :fullName, :userName', 
          {replacements: {emailAddress: emailAddress, firstName: firstName, lastName: lastName, fullName: fullName, userName: userName}, type: sequelize.QueryTypes.SELECT})
          .then(userData => {

            // treeize the data to get a nested object (for permissions)
            const userDataTree = new Treeize();
            userDataTree.grow(userData);
            const userDataTreeized = userDataTree.getData();

            // build a token using jwt
            const newToken = jwt.sign(
              {
                userData: userDataTreeized[0]
              }, 
              tokenSecret, 
              {expiresIn: expirationTime}
            );

            // decode the token to get the issued at and expiring at timestamps
            const decodedToken = token.decode(newToken);

            // send back a response with the ldap user object, saved jarvis user object, new user (yes), and jwt token
            res.json({
              ldapUser: ldapUser,
              jarvisUser: userDataTreeized[0],
              token: {
                signedToken: newToken,
                issuedAt: decodedToken.iat,
                expiringAt: decodedToken.exp
              }
            });

            // TEMP CODE: testing websockets
            loggedInUsers.push(userDataTreeized[0]);
          

        })
        .catch(error => {
          res.status(400).json({
            title: 'Error (in catch)',
            error: {message: error}
          })
        });

        

      }
    
    // if an ldap error object is returned, this indicates authentication failure
    } else if (err) {

      // log the ldap response time
      const timeDiff = process.hrtime(startTime);
      console.log("ldap response took: " + (timeDiff[1] / 1e6) + " milliseconds.")
      
      // send a an error response (status code 500) indicating the credentials are invalid
      res.status(500).json({
        title: 'invalid user credentials',
        error: err
      });

    }
  });
  
  // TO-DO: figure out what this is for
  auth.close((err) => {
    if (err) {
      console.log('error on close:');
      console.log(err);
    }
  })

}


// verify and decode the token to get user info, issued at and expiring at data
function getInfoFromToken(req, res) {

  const decodedToken = token.decode2(req.header('X-JWT'), res);

  // NOTE: the token is not updated here; only user data is returned from the decoded token
  res.json({
    jarvisUser: decodedToken.userData,
    token: {
      signedToken: req.header('X-JWT'),
      issuedAt: decodedToken.iat,
      expiringAt: decodedToken.exp
    }
  });

}


// function to get a new token and jarvis user
// NOTE: new jarvis user is retrived in case permissions or other details have changed
function resetToken(req, res) {

  const decodedToken = token.decode(req.header('X-JWT'));

  // execute the stored procedure to get the user data, role, and permissions
  // it will also insert a new record into the employees table if this is a new user
  sequelize.query('EXECUTE resources.AuthData :emailAddress, :firstName, :lastName, :fullName, :userName', 
    {replacements: {emailAddress: decodedToken.userData.email, firstName: decodedToken.userData.firstName, lastName: decodedToken.userData.lastName, fullName: decodedToken.userData.fullName, userName: decodedToken.userData.userName}
      , type: sequelize.QueryTypes.SELECT})
    .then(userData => {

      // treeize the data to get a nested object (for permissions)
      const userDataTree = new Treeize();
      userDataTree.grow(userData);
      const userDataTreeized = userDataTree.getData();

      // build a token using jwt
      const newToken = jwt.sign(
        {
          userData: userDataTreeized[0]
        }, 
        tokenSecret, 
        {expiresIn: expirationTime}
      );

      // decode the token to get the issued at and expiring at timestamps
      const decodedToken = token.decode(newToken);

      // send back a response with the jarvis user object and jwt token
      res.json({
        jarvisUser: userDataTreeized[0],
        token: {
          signedToken: newToken,
          issuedAt: decodedToken.iat,
          expiringAt: decodedToken.exp
        }
      });
    
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });

}


// simply verify the token and return status code 200 (OK) or 401 (Unauthorized)
function verifyToken(req, res) {

  // get the token out of the request header
  const token = req.header('X-JWT');

  // send the token through verification and send the appropriate response
  jwt.verify(token, tokenSecret, (err, decoded) => {
    if (decoded) {
      res.status(200).json({
        tokenIsValid: true
      });
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

  res.json(`user ${userName} has been removed from the array of logged in users`);

}


module.exports = {
  authenticate: authenticate,
  getInfoFromToken: getInfoFromToken,
  resetToken: resetToken,
  verifyToken: verifyToken,
  getLoggedInUsers: getLoggedInUsers,
  logout: logout,
  getLoginBackgroundImages: getLoginBackgroundImages
}
