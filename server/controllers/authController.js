
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

const tokenSecret = process.env.JWT_SECRET;  // get the secret code word for enconding and decoding the token with jwt
const expirationTime = 60 * 30  // set the token expiration time to 30 minutes - units are seconds: 60 (secs) * 60 (mins) * 24 (hrs) * 1 (days)

// TEMP CODE: testing websockets
 var loggedInUsers = [];


function authenticate(req, res) {

  // get the user object from the request payload/body (user name and password)
  const user = req.body;

  // set the ldap object
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
      // TO-DO: this could probably be removed
      if (ldapUser.cn === user.userName) {

        // log the ldap response time
	      const timeDiff = process.hrtime(startTime);
        console.log("ldap response took: " + (timeDiff[1] / 1e6) + " milliseconds.")
        
        // set variables using the ldap object
        // mainly the reason for doing this here is for testing, to be able to impersonate a manager etc.
        let userName = ldapUser.cn;
        let emailAddress = ldapUser.mail;
        let firstName = ldapUser.givenName;
        let lastName = ldapUser.sn;

        // TEMP CODE: impersonate as a manager for testing
        // userName = 'ethanh';
        // emailAddress = 'ethan_hunt@keysight.com';
        // firstName = 'ETHAN';
        // lastName = 'HUNT'

        // determine if the user is a manager
        
        const sql = `
          SELECT
            COUNT(*) AS numEmployees
          FROM
            resources.PLMPerAllPeopleOrg T1
            INNER JOIN resources.PLMPerAllPeopleOrg T2 ON T1.PERSON_ID = T2.SUPERVISOR_ID
          WHERE
            T1.EMAIL_ADDRESS = :emailAddress
        `;
        sequelize.query(sql, {replacements: {emailAddress: emailAddress}, type: sequelize.QueryTypes.SELECT})
          .then(employeesCount => {

            // set a boolean variabled based on the employee count
            const isManager = employeesCount[0].numEmployees >= 1 ? true : false;

            // check the Employees table to determine if this is an existing Jarvis user or not
            // using the user name as the unique key (note could use email as alternative)
            models.User.findOne({
              where: {userName: userName}
            }).then(jarvisUser => {

              // if this is an existing jarvis user, send back a response
              // with the ldap user object, jarvis user object, new user (no), and jwt token
              if (jarvisUser) {

                // build an encrypted token using jwt
                const token = jwt.sign(
                  {
                    id: jarvisUser.id,
                    firstName: jarvisUser.firstName,
                    lastName: jarvisUser.lastName,
                    fullNname: jarvisUser.fullName,
                    userName: jarvisUser.userName,
                    email: jarvisUser.email,
                    isManager: isManager
                  }, 
                  tokenSecret, 
                  {expiresIn: expirationTime}
                );

                // decode the token to get the issued at and expiring at timestamps
                var decodedToken;
                jwt.verify(token, tokenSecret, (err, decoded) => {
                  if (decoded) {
                    console.log('decoded token:');
                    console.log(decoded);
                    decodedToken2 = decoded;
                  } else {
                    console.log('token is invalid');
                  }
                })

                // send back a response with the ldap user object, saved jarvis user object, new user (yes), and jwt token
                res.json({
                  ldapUser: ldapUser,
                  jarvisUser: jarvisUser,
                  isManager: isManager,
                  newUser: false,
                  token: {
                    signedToken: token,
                    issuedAt: decodedToken2.iat,
                    expiringAt: decodedToken2.exp
                  }
                });

              // if this is not an existing jarvis user, add a record to the Employees table before sending the response
              } else {

                // build the full name to insert into the employees table (need to convert FIRSTNAME LASTNAME to Firstname Lastname)
                var fullName = firstName + ' ' + lastName;
                fullName = fullName.replace(/\w\S*/g, text => {
                  return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
                });

                // get the first and last name from the full name
                const nameArr = fullName.split(' ');
                firstName = nameArr[0];
                lastName = nameArr[nameArr.length - 1];

                // insert a record into the Employees table
                // TO-DO: figure out what to set for forcePasswordReset
                models.User.create({
                  firstName: firstName,
                  lastName: lastName,
                  fullName: fullName,
                  userName: userName,
                  email: emailAddress,
                  roleID: 4,  // report user
                  loginEnabled: true,
                  forcePasswordReset: false,
                  startUpTutorialFTE: true,
                  startUpTutorialProjects: true,
                  createdBy: 1,
                  createdAt: moment().add(moment().utcOffset() / 60, 'hours'),
                  updatedBy: 1,
                  updatedAt: moment().add(moment().utcOffset() / 60, 'hours')
                })
                .then(savedUser => {


                  // build an encrypted token using jwt
                  const token = jwt.sign(
                    {
                      id: savedUser.id,
                      firstName: savedUser.firstName,
                      lastName: savedUser.lastName,
                      fullNname: savedUser.fullName,
                      userName: savedUser.userName,
                      email: savedUser.email,
                      isManager: isManager
                    }, 
                    tokenSecret, 
                    {expiresIn: expirationTime}
                  );

                  // decode the token to get the issued at and expiring at timestamps
                  var decodedToken;
                  jwt.verify(token, tokenSecret, (err, decoded) => {
                    if (decoded) {
                      console.log('decoded token:');
                      console.log(decoded);
                      decodedToken2 = decoded;
                    } else {
                      console.log('token is invalid');
                    }
                  })

                  // send back a response with the ldap user object, saved jarvis user object, new user (yes), and jwt token
                  res.json({
                    ldapUser: ldapUser,
                    jarvisUser: savedUser,
                    isManager: isManager,
                    newUser: true,
                    token: {
                      signedToken: token,
                      issuedAt: decodedToken2.iat,
                      expiringAt: decodedToken2.exp
                    }
                  });
                  
                  // TEMP CODE: testing websockets
                  loggedInUsers.push(jarvisUser);
                  
                }); // end of create/insert new jarvis user

              } // end of if jarvis user 

            }); // end of find jarvis user query (find one)

          }); // end of manager check query

      } // end of ldap username matches if case
    
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

  // extract the token from the query parameters/string (after the ? in the url)
  const token = req.query.token;

  jwt.verify(token, tokenSecret, (err, decoded) => {
    // if the token was successfully decoded
    if (decoded) {

      console.log('get info from token, decoded token:');
      console.log(decoded);

      // use the user name in the decoded token to get the employee record from the Jarvis database
      models.User.findOne({
        where: {userName: decoded.userName}
      }).then(jarvisUser => {

        // send back a response with the ldap user object, jarvis user object, new user (no), and jwt token
        res.json({
          jarvisUser: jarvisUser,
          newUser: false,
          token: {
            signedToken: req.query.token,
            issuedAt: decoded.iat,
            expiringAt: decoded.exp
          }
        });

      })
    
    // if the token was not successfully decoded this means either it is expired or was modified thus couldn't be decoded
    } else if (err) {

      // send back a response with an error status code
      return res.status(401).json({
        title: 'the token is not valid (is expired or was tampered with)',
        error: err
      });

    }
  })

}


// function to get a new token (currently, only needed to push out the expiration date)
function resetToken(req, res) {

  // get the user name from the request body
  const userName = req.body.userName;

  // TO-DO: decide if this really necessary to get the user again
  // get the employee record from the Jarvis database
  models.User.findOne({
    where: { userName: userName }
  })
  .then(jarvisUser => {

    // if the database was able to find the user record and return an object
    if (jarvisUser) {

      // var decodedToken;
      // jwt.verify(req.query.token, tokenSecret, (err, decoded) => {
      //   if (decoded) {
      //     decodedToken = decoded;
      //   } else {
      //     console.log('token is invalid');
      //   }
      // })

      // console.log('decoded token within reset token:');
      // console.log(decodedToken);

      // generate a new token and set the new expiration datetime
      const token = jwt.sign(
        {
          id: jarvisUser.id,
          firstName: jarvisUser.firstName,
          lastName: jarvisUser.lastName,
          fullName: jarvisUser.fullName,
          userName: jarvisUser.userName,
          email: jarvisUser.email
        }, 
        tokenSecret, 
        {expiresIn: expirationTime}
      );

      // decode the token to get the issued at and expired at datetimes
      jwt.verify(token, tokenSecret, (err, decoded) => {
        // if the decode was successfull
        if (decoded) {

          // send back a response with the ldap user object, saved jarvis user object, new user (yes), and jwt token
          res.json({
            jarvisUser: jarvisUser,
            newUser: false,
            token: {
              signedToken: token,
              issuedAt: decoded.iat,
              expiringAt: decoded.exp
            }
          });

        // if the decode failed (this should not happen, if it does there is probably a bug in the code)
        } else if (err) {
          console.log('token is invalid (weird because we just created it!)');
        }
      })

    // if the database was not able to find the user (if this happens, there is probably a bug or some design flaw)
    } else {

      // send back a response with an error status code
      res.status(401).json({
        title: 'reset token failed',
        error: {message: `invalid user name: ${userName}`}
      });

    }
  })
  .catch(error => {

    // send back a response with an error status code
    res.status(401).json({
      title: 'reset token failed (in catch)',
      error: {message: error}
    });
  })

}



function resetTokenWithToken(req, res) {

  // extract the token from the query parameters/string (after the ? in the url)
  const token = req.query.token;

  jwt.verify(token, tokenSecret, (err, decoded) => {
    // if the token was successfully decoded
    if (decoded) {

      // use the user name in the decoded token to get the employee record from the Jarvis database
      models.User.findOne({
        where: {userName: decoded.userName}
      }).then(jarvisUser => {

        // create a new token
        const token = jwt.sign(
          {
            userName: jarvisUser.userName,
            email: jarvisUser.email, 
            rememberMe: true
          }, 
          tokenSecret, 
          {expiresIn: expirationTime}
        );

        // decode the token to get the issued at and expired at datetimes
        jwt.verify(token, tokenSecret, (err, decoded) => {
          // if the decode was successfull
          if (decoded) {

            // send back a response with the ldap user object, jarvis user object, new user (no), and jwt token
            res.json({
              jarvisUser: jarvisUser,
              newUser: false,
              token: {
                signedToken: token,
                issuedAt: decoded.iat,
                expiringAt: decoded.exp
              }
            });

          // if the decode failed (this should not happen, if it does there is probably a bug in the code)
          } else if (err) {
            console.log('token is invalid (weird because we just created it!)');
          }
        })

      })
    
    // if the token was not successfully decoded this means either it is expired or was modified thus couldn't be decoded
    } else if (err) {

      // send back a response with an error status code
      return res.status(401).json({
        title: 'the token is not valid (is expired or was tampered with)',
        error: err
      });

    }
  })

}


// return all users in the Employees table
function index(req, res) {

  models.User.findAll({
  }).then(users => {
    console.log("Returning users data (all)");
    res.json(users);
  });

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
  index: index,
  getLoggedInUsers: getLoggedInUsers,
  logout: logout,
  getLoginBackgroundImages: getLoginBackgroundImages
}
