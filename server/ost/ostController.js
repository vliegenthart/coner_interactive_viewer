var express = require('express');
var router = express.Router();

var userController = require('./userController');
router.use('/users', userController)

module.exports = router;