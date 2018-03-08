
const models = require('../models/_index')
const sequelize = require('../db/sequelize').sequelize;
const LdapAuth = require('ldapauth-fork');
 


function authenticate(req, res) {

  // const userName = req.params.userName;
  // const password = req.params.password;
  console.log(req.params.user);

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
   
  const auth = new LdapAuth(options);
  auth.on('error', (err) => {
    console.log('error on authentication:');
    console.error(err);
  });
   
  auth.authenticate(userName, password, (err, user) => {
    if (user) {
      if (user.cn === userName) {
	      const timeDiff = process.hrtime(startTime);
	      console.log("ldap response took: " + (timeDiff[1] / 1e6) + " milliseconds.")
        // console.log('user is authenticated!');
        // console.log('user email is: ' + user.mail);
        // console.log('full user details:');
        // console.log(user);
        models.User.findOne({
          where: {email: user.mail}
        }).then(jarvisUser => {

          res.json({
            ldap: user,
            jarvis: jarvisUser
          });

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
