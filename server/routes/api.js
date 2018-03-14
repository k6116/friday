const express = require('express');
const router = express.Router();
const app = express();

var controllers = require('../controllers/_index.js');

// AUTH CONTROLLER 
router.get('/users', controllers.auth.index);
router.post('/login', controllers.auth.authenticate);
router.get('/getInfoFromToken', controllers.auth.getInfoFromToken);
router.post('/resetToken', controllers.auth.resetToken);


module.exports = router;
