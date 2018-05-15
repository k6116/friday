
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

// '0 6 1 2,5,8,11 *'
schedule.scheduleJob(('15 17 15 2,5,8,11 *'), () => {
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