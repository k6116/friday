
const Sequelize = require('sequelize');
const configPLM = require('./config').configPLM;
const config = require('./config').config;


const sequelize = new Sequelize(config.dbname, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
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
      console.log(`SQL Server connection to database '${sequelizePLM.config.database}' has been established successfully`);
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });


}

module.exports = {
  sequelize: sequelize,
  sequelizePLM: sequelizePLM,
  connect: connect
};
