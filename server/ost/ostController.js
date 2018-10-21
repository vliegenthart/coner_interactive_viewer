const ostConfig = require('./config')

var express = require('express');
var router = express.Router();

var userController = require('./userController');
var airdropController = require('./airdropController');
var actionController = require('./actionController');
var transactionController = require('./transactionController');
var balanceController = require('./balanceController');
var ledgerController = require('./ledgerController');

if (ostconfig.tokenName) {
  router.use('/users', userController)
  // router.use('/airdrops', userController)
  router.use('/actions', actionController)
  router.use('/transactions', transactionController)
  router.use('/balances', balanceController)
  router.use('/ledgers', ledgerController)
}


module.exports = router;