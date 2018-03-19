const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const https = require('https');
const app = express();
const api = require('./server/routes/api');
const sequelize = require('./server/db/sequelize');

// var sslOptions = {
//   key: fs.readFileSync('./etc/ssl/wcos.key'),
//   cert: fs.readFileSync('./etc/ssl/wcosofw2.cos.is.keysight.com.crt'),
//   requestCert: true,
//   ca: [
//     fs.readFileSync('./etc/ssl/Keysight_Intermediate.crt'),
//     fs.readFileSync('./etc/ssl/Keysight_Root.crt')
//   ],
//   rejectUnauthorized: false 
// };

// connect to the database
sequelize.connect();

// set body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static('public'));

// send api requests to the server/routes/api.js file
app.use('/api', api);

// send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// set the port
const port = process.env.PORT || '3000';
// const port = process.env.PORT || '443';
app.set('port', port);

// start the server
const server = http.createServer(app);
// const server = https.createServer(sslOptions, app);
server.listen(port, () => console.log(`Running on localhost:${port}`));
