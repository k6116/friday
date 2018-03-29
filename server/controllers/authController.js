
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const ldapAuth = require('ldapAuth-fork');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const momentTz = require('moment-timezone');

const tokenSecret = 'rutabega';  // set the secret code word for enconding and decoding the token with jwt
const expirationTime = 60 * 60 * 1  // units are seconds: 60 (secs) * 60 (mins) * 24 (hrs) * 1 (days)


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
        
        // build an encrypted token using the jsonwebtoken module
        // set it to expire in 1 hour
        const token = jwt.sign(
          {
            userName: ldapUser.cn,
            email: ldapUser.mail, 
            rememberMe: true
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

        // check the Employees table to determine if this is an existing Jarvis user or not
        // using the user name as the unique key (note could use email as alternative)
        models.User.findOne({
          where: {userName: ldapUser.cn}
        }).then(jarvisUser => {
          
          // if this is an existing jarvis user, send back a response
          // with the ldap user object, jarvis user object, new user (no), and jwt token
          if (jarvisUser) {
            res.json({
              ldapUser: ldapUser,
              jarvisUser: jarvisUser,
              newUser: false,
              token: {
                signedToken: token,
                issuedAt: decodedToken2.iat,
                expiringAt: decodedToken2.exp
              }
            });
          // if this is not an existing jarvis user, add a record to the Employees table before sending the response
          } else {

            // build the full name to insert into the table (need to convert FIRSTNAME LASTNAME to Firstname Lastname)
            var fullName = ldapUser.givenName + ' ' + ldapUser.sn;
            fullName = fullName.replace(/\w\S*/g, text => {
              return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
            });

            // insert a record into the Employees table
            // TO-DO: figure out what to set for roldID and forcePasswordReset
            models.User.create({
              fullName: fullName,
              userName: ldapUser.cn,
              email: ldapUser.mail,
              roleID: 1,
              loginEnabled: true,
              forcePasswordReset: false,
              createdBy: 1,
              createdAt: moment().subtract(8, 'hours'),
              updatedBy: 1,
              updatedAt: moment().subtract(8, 'hours')
            })
            .then(savedUser => {

              // send back a response with the ldap user object, saved jarvis user object, new user (yes), and jwt token
              res.json({
                ldapUser: ldapUser,
                jarvisUser: savedUser,
                newUser: true,
                token: token
              });

            })
        
          }

        });

      }
    // if an error object is returned, this indicates authentication failure
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

      // generate a new token and set the new expiration datetime
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


// return all users in the Employees table
function index(req, res) {

  models.User.findAll({
  }).then(users => {
    console.log("Returning users data (all)");
    res.json(users);
  });

}


module.exports = {
  authenticate: authenticate,
  getInfoFromToken: getInfoFromToken,
  resetToken: resetToken,
  index: index
}
