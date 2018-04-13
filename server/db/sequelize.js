
const Sequelize = require('sequelize')
const config = require('./config');


const sequelize = new Sequelize(config.config1.dbname, config.config1.username, config.config1.password, {
  host: config.config1.host,
  dialect: config.config1.dialect
});

const sequelize2 = new Sequelize(config.config2.dbname, config.config2.username, config.config2.password, {
  host: config.config2.host,
  dialect: config.config2.dialect
});


function connect() {

  sequelize
    .authenticate()
    .then(() => {
      console.log(`SQL Server connection to database '${sequelize.config.database}' has been established successfully`);
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });

  sequelize2
    .authenticate()
    .then(() => {
      console.log(`SQL Server connection to database '${sequelize2.config.database}' has been established successfully`);
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });

}

module.exports = {
  sequelize: sequelize,
  sequelize2: sequelize2,
  connect: connect
};
