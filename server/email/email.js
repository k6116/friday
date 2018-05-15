
const schedule = require('node-schedule');
const moment = require('moment');
const axios = require("axios");


function setSchedules() {

// SET FTE REMINDERS EVERY 3 MONTHS
// (1 2,5,8,11 *)
schedule.scheduleJob('10 * * * * *', () => {
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