const logger = require('../logs/logs');


function writeToLog(req, res) {

  // get the request body into a constant
  const log = req.body;

  // write entry to log file
  logger.writeLog(log.level, log.message, log.metadata);

  // send a response
  res.status(200).json({
    message: 'log has been written successfully'
  });

}


module.exports = {
  writeToLog: writeToLog
}