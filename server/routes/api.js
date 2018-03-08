const express = require('express');
const router = express.Router();
const app = express();

var controllers = require('../controllers/_index.js');


router.get('/users', controllers.auth.index);
router.get('/login/:user', controllers.auth.authenticate);


module.exports = router;
