const tracer = require('dd-trace').init()
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const dotevnv = require('dotenv').config()

const api = require('./server/routes/api');

const sequelize = require('./server/db/sequelize');
const email = require('./server/email/email');
const websockets = require('./server/websockets/websockets');

// datadog (node)
const StatsD = require('node-dogstatsd').StatsD;
const dogstatsd = new StatsD();

// datadog (express)
const dd_options = {
  'response_code':true,
  'tags': ['app:my_app']
}
const connect_datadog = require('connect-datadog')(dd_options);

// create the express application
const app = express();

// set the ssl options object, reading keys and certs from the filesystem
var sslOptions = {
  key: fs.readFileSync('./etc/ssl/jarvis.key'),
  cert: fs.readFileSync('./etc/ssl/jarvis.crt'),
  requestCert: true,
  ca: [
    fs.readFileSync('./etc/ssl/Keysight_Intermediate.crt'),
    fs.readFileSync('./etc/ssl/Keysight_Root.crt')
  ],
  rejectUnauthorized: false 
};

// connect to the database(s)
sequelize.connect();

// set body parsers
// need to set bodyParser limit to allow a large number of projects.  Default is 1mb, which can only support ~15 projects
app.use(bodyParser.json({limit: '30mb'}));
app.use(bodyParser.urlencoded({limit: '30mb', extended: true }));

// serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static('public'));

// middleware for datadog express integration (for metrics)
app.use(connect_datadog);

// middleware function to send any api requests to the server/routes/api.js file
app.use('/api', api);

// send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// get environment/instance (dev, test, or prod)
const env = process.env.ENVIRONMENT;

// declare variable for socket.io use
var server;

// start development server
if (env === 'dev') {

  const port1 = 3000;
  server = http.createServer(app)
    .listen(port1, () => {
      console.log(`node server listening on port: ${port1}`);
    });

// start test server
} else if (env === 'test') {

  // create a node server for https on port 440 for testing on the webserver
  const port1 = 440;
  server = https.createServer(sslOptions, app)
    .listen(port1, () => {
      console.log(`node server listening on port: ${port1}`);
    });

// start production server
} else if (env === 'prod') {

  // create a node server for https on port 443
  const port1 = 443;
  server = https.createServer(sslOptions, app)
    .listen(port1, () => {
      console.log(`node server listening on port: ${port1}`);
    });

  // create a second node server to forward http (port 80) requests to https (port 443)
  const port2 = 80;
  http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  })
  .listen(80, () => {
    console.log(`node server listening on port: ${port2}`);
  });

}

// send and receive real-time websockets messages
websockets.listen(server);

//SET EMAIL SCHEDULES
email.setSchedules();

