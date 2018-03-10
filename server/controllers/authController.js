
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const ldapAuth = require('ldapAuth-fork');
const jwt = require('jsonwebtoken');
const moment = require('moment');


function authenticate(req, res) {


  const startTime = process.hrtime();

  const user = JSON.parse(req.params.user);
  const userName = user.userName;
  const password = user.password;

  console.log(`authenticating ${userName}`);

  const options = {
    url: 'ldap://adldap.cos.is.keysight.com',
    bindDN: `cn=${userName},cn=users,dc=ad,dc=keysight,dc=com`,
    bindCredentials: password,
    searchBase: 'dc=ad,dc=keysight,dc=com',
    searchFilter: '(cn={{username}})'
  };
   
  const auth = new ldapAuth(options);
  auth.on('error', (err) => {
    console.log('error on authentication:');
    console.error(err);
  });
   
  auth.authenticate(userName, password, (err, user) => {
    if (user) {
      if (user.cn === userName) {
	      const timeDiff = process.hrtime(startTime);
        console.log("ldap response took: " + (timeDiff[1] / 1e6) + " milliseconds.")
        
        const token = jwt.sign(
          {
            userName: user.cn,
            email: user.email, 
            rememberMe: true
          }, 
          'superSecret', 
          {expiresIn: 60 * 60 * 24 * 1}
        );

        models.User.findOne({
          where: {userName: user.cn}
        }).then(jarvisUser => {
          
          if (jarvisUser) {
            res.json({
              ldapUser: user,
              jarvisUser: jarvisUser,
              newUser: false,
              token: token
            });
          } else {

            var fullName = user.givenName + ' ' + user.sn;
            fullName = fullName.replace(/\w\S*/g, text => {
              return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
            });

            models.User.create({
              fullName: fullName,
              userName: user.cn,
              email: user.mail,
              roleID: 1,
              loginEnabled: true,
              forcePasswordReset: false,
              createdBy: 1,
              createdAt: moment().format('YYYY-MM-DD'),
              updatedBy: 1,
              updatedAt: moment().format('YYYY-MM-DD')
            })
            .then(savedUser => {

              res.json({
                ldapUser: user,
                jarvisUser: savedUser,
                newUser: true,
                token: token
              });

            })
            

          }

          

        });

      }
    } else if (err) {
      const timeDiff = process.hrtime(startTime);
	    console.log("ldap response took: " + (timeDiff[1] / 1e6) + " milliseconds.")
      // console.log('invalid user credentials');
      res.status(500).json({
        title: 'invalid user credentials',
        error: err
      });
    }
  });
   
  auth.close((err) => {
    if (err) {
      console.log('error on close:');
      console.log(err);
    }
  })

}




function index(req, res) {

  models.User.findAll({
    // attributes: ['id', 'partNumber', 'description'],
    // order: ['partNumber']
  }).then(users => {
    console.log("Returning users data (all)");
    res.json(users);
  });

}


module.exports = {
  authenticate: authenticate,
  index: index
}
