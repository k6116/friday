
const schedule = require('node-schedule');
const moment = require('moment');
const axios = require("axios");


function setSchedules() {

// SET FTE REMINDERS EVERY 3 MONTHS

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

// TO-DO: If ENV = PROD then use quarterly schedule
// TO-DO MIKE: use the .env file (process.env.ENVIRONMENT)
let sched = '';
if (1 == 0) {
  sched = '0 6 1 2,5,8,11 *'; // Quarterly Schedule for PROD
} else {
  sched = '23 14 30 2,5,8,11 *'; // By the Minute testing for Non-PROD
}

// NOTE: enter quarterly fte values reminder email will be sent out either first day of quarter, or if possible first monday of quarter (10am)
// TO-DO MIKE: check out recurrance rules with node schedule to see if first monday is possible 

schedule.scheduleJob((sched), () => {
    console.log('node-schedule event fired at: ' + moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));
    axios
      .post(`http://localhost:3000/api/sendFTEReminder`)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  });

}

module.exports = {
  setSchedules: setSchedules
}