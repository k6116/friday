
const dotevnv = require('dotenv').config(
  {path: '/.env'}
);

// get environment/instance (dev, test, or prod)
const env = process.env.ENVIRONMENT;

// TO-DO BILL: move passwords to .env file

const configPLM = {
  dbname: "OracleWorkSpace",
  host: 'PLMBRIDGE.COS.IS.KEYSIGHT.COM',
  username: 'DARWIN_USER',
  password: 'sp_f1nches',
  dialect: 'mssql'
};

const config2017 = {
  dbname: "JarvisResources",
  host: 'WCOSOFW2.COS.IS.KEYSIGHT.COM',
  username: 'JarvisRTUser',
  password: '3pineapple#',
  dialect: 'mssql'
};

// database configuration info for Jarvis DB on spyglass
// using .env file to switch between production and test databases
let config;

if (env === 'prod') {
  config = {
    dbname: "Jarvis",
    host: 'SPYGLASS.SRS.IS.KEYSIGHT.COM',
    username: 'JarvisRTUser',
    password: '3pineapple#',
    dialect: 'mssql'
  };
} else {
  // use the test database
  config = {
    dbname: "Jarvis_Resources",
    host: 'SPYGLASS.SRS.IS.KEYSIGHT.COM',
    username: 'JarvisRTUser',
    password: '3pineapple#',
    dialect: 'mssql'
  };
}

module.exports = {
  config: config, 
  configPLM: configPLM,
  config2017: config2017
};
