const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const api = require('./server/routes/api');
const sequelize = require('./server/db/sequelize');
const dotevnv = require('dotenv').config()

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

// create the express application
const app = express();

// set body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static('public'));

// middleware function to send any api requests to the server/routes/api.js file
app.use('/api', api);

// send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


// get environment (dev or prod)
const isProd = process.env.PRODUCTION;

// start development server
if (isProd === 'false') {

  const port1 = 3000;
  http.createServer(app)
    .listen(port1, () => {
      console.log(`node server listening on port: ${port1}`);
    });

// start production server
} else {

  // create a node server for https on port 443
  const port1 = 443;
  https.createServer(sslOptions, app)
    .listen(port1, () => {
      console.log(`node server listening on port: ${port1}`);
    });

  // create a second node server for to forward http (port 80) requests to https (port 443)
  const port2 = 80;
  http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  })
  .listen(80, () => {
    console.log(`node server listening on port: ${port2}`);
  });


}


