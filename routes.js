const express = require('express');
const router = express.Router();

var ostController = require('./server/ost/ostController');

router.use('/ost', ostController)

module.exports = router;
