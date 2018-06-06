const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const api = require('./server/routes/api');
const sequelize = require('./server/db/sequelize');
const dotevnv = require('dotenv').config()

// create the express application
const app = express();


// const httpServer = require('http').Server(app);


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

// middleware function to send any api requests to the server/routes/api.js file
app.use('/api', api);

// send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


// get environment/instance (dev, test, or prod)
const env = process.env.ENVIRONMENT;

// start development server
var server;
if (env === 'dev') {

  const port1 = 3000;
  server = http.createServer(app)
    .listen(port1, () => {
      console.log(`node server listening on port: ${port1}`);
    });

// start test server
} else if (env === 'test') {

  // create a node server for https on port 443
  const port1 = 440;
  server = https.createServer(sslOptions, app)
    .listen(port1, () => {
      console.log(`node server listening on port: ${port1}`);
    });

  // create a second node server to forward http (port 80) requests to https (port 443)
  const port2 = 80;
  server = http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  })
  .listen(80, () => {
    console.log(`node server listening on port: ${port2}`);
  });

// start production server
} else if (env === 'prod') {

  // create a node server for https on port 443
  const port1 = 443;
  https.createServer(sslOptions, app)
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

// console.log(server);
var io = require('socket.io')(server);

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('message', function (message) {
    io.emit('message', message);
  });
  socket.on('disconnect', function(){
    console.log('a user disconnected');
  });
});



