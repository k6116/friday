
const dotevnv = require('dotenv').config(
  {path: '/.env'}
);

// get environment/instance (dev, test, or prod)
const env = process.env.ENVIRONMENT;


const configPLM = {
  dbname: "OracleWorkSpace",
  host: 'PLMBRIDGE.COS.IS.KEYSIGHT.COM',
  username: 'DARWIN_USER',
  password: process.env.PLMBRIDGE_DB_PASSWORD,
  dialect: 'mssql'
};

const config2017 = {
  dbname: "Jarvis",
  host: 'SPYGLASS.SRS.IS.KEYSIGHT.COM',
  username: 'JarvisRTUser',
  password: process.env.SPYGLASS_DB_PASSWORD,
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
    password: process.env.SPYGLASS_DB_PASSWORD,
    dialect: 'mssql'
  };
} else {
  // use the test database
  config = {
    // dbname: "Jarvis_Resources",
    dbname: "Jarvis_DEV",
    // dbname: "Jarvis",
    host: 'SPYGLASS.SRS.IS.KEYSIGHT.COM',
    username: 'JarvisRTUser',
    password: process.env.SPYGLASS_DB_PASSWORD,
    dialect: 'mssql'
  };
}

module.exports = {
  config: config, 
  configPLM: configPLM,
  config2017: config2017
};
