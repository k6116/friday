const path = require('path');
const winston = require('winston');
const dotevnv = require('dotenv').config()

// get environment/instance (dev, test, or prod)
const env = process.env.ENVIRONMENT;

// declare variable to hold instance of the winston logger
var logger;

// create an instance of a logger
function createLogger() {

  logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: path.join(__dirname, `../../../logs/${env}.log`), level: 'info' })
    ]
  });

  console.log('logger creaeted');

}

// write an entry to the log file
function writeLog(level, message, metadata) {

  logger.log(level, message, metadata);

  console.log('message has been logged');

}


module.exports = {
  createLogger: createLogger,
  writeLog: writeLog
}