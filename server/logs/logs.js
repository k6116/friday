const path = require('path');
const winston = require('winston');
const dotevnv = require('dotenv').config()

// get environment/instance (dev, test, or prod)
const env = process.env.ENVIRONMENT;

var logger;

// create logger instance
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({ filename: path.join(__dirname, `../../../logs/${env}/log.log`), level: 'info' })
//   ]
// });

// console.log('checking logs directory:')
// console.log(path.join(__dirname, `../../../logs/${env}/log.log`));

// console.log('what the hell is going on here?');

// logger.log('info', 'Hello simple log!');
// logger.info('Hello log with metas',{color: 'blue' });

function createLogger() {

  logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: path.join(__dirname, `../../../logs/${env}/log.log`), level: 'info' })
    ]
  });

  console.log('logger creaeted');
  // console.log(logger);

}

function writeLog(level, message, metadata) {

  logger.log(level, message, metadata);
  // logger.log('info', 'Hello simple log!');
  // logger.info('Hello log with metas',{color: 'blue' });

  console.log('message has been logged');

}


module.exports = {
  createLogger: createLogger,
  writeLog: writeLog
}