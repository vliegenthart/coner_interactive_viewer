const express = require('express');
const router = express.Router();

var ostController = require('./server/ost/ostController');
var cmcController = require('./server/cmc/cmcController');

router.use('/ost', ostController)
router.use('/cmc', cmcController)


module.exports = router;
