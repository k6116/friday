
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const ldapAuth = require('ldapAuth-fork');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const momentTz = require('moment-timezone');


function authenticate(req, res) {

  // parse the user param into a user object
  const user = JSON.parse(req.params.user);

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
        // set it to expire in 1 day
        const token = jwt.sign(
          {
            userName: ldapUser.cn,
            email: ldapUser.email, 
            rememberMe: true
          }, 
          'superSecret', 
          {expiresIn: 60 * 60 * 24 * 1}
        );

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
              token: token
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


function index(req, res) {

  models.User.findAll({
  }).then(users => {
    console.log("Returning users data (all)");
    res.json(users);
  });

}


module.exports = {
  authenticate: authenticate,
  index: index
}
