
const Sequelize = require('sequelize');
const config = require('./config').config;
const configPLM = require('./config').configPLM;
const config2017 = require('./config').config2017;


const sequelize = new Sequelize(config.dbname, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

const sequelize2017 = new Sequelize(config2017.dbname, config2017.username, config2017.password, {
  host: config2017.host,
  dialect: config2017.dialect
});

const sequelizePLM = new Sequelize(configPLM.dbname, configPLM.username, configPLM.password, {
  host: configPLM.host,
  dialect: configPLM.dialect
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

    sequelizePLM
      .authenticate()
      .then(() => {
        console.log(`SQL Server connection to PLM database '${sequelizePLM.config.database}' has been established successfully`)
      })
      .catch(err => {
        console.error('Unable to connect to the PLM database:', err);
      });

    sequelize2017
      .authenticate()
      .then(() => {
        console.log(`SQL Server connection to 2017 database '${sequelize2017.config.database}' has been established successfully`);
      })
      .catch(err => {
        console.error('Unable to connect to the 2017 database:', err);
      });

}
  

module.exports = {
  sequelize: sequelize,
  sequelizePLM: sequelizePLM,
  sequelize2017: sequelize2017,
  connect: connect
}