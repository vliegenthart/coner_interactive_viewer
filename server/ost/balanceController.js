var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const ostConfig = require('./config')
const OSTSDK = require('@ostdotcom/ost-sdk-js');
const ostObj = new OSTSDK({apiKey: ostConfig.settings.apiKey, apiSecret: ostConfig.settings.apiSecret, apiEndpoint: ostConfig.settings.ostApiEndpoint});
const balanceService = ostObj.services.balances;

// GET BALANCE
router.get('/:id', (req, res) => {
  balanceService.get({id: req.params.id}).then(function(ost_res) { 
    res.status(200).send({ body: JSON.stringify(ost_res) }); 
  }).catch(function(err) { 
     return res.status(500).send("There was a problem finding this OSt user's balance.");; 
  });
});

module.exports = router;
