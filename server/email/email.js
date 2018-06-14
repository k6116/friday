
const schedule = require('node-schedule');
const moment = require('moment');
const axios = require("axios");
const env = process.env.ENVIRONMENT;

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

let sched = '';
if (env === 'prod') {
  sched = '0 10 1,2,3,4,5,6,7 2,5,8,11 1'; // PROD Schedule: 10AM on First Monday of each Designated Month
} else {
  sched = '23 14 30 2,5,8,11 *'; // DEV Schedule: Can Alter for By-The-Minute-Testing
}

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