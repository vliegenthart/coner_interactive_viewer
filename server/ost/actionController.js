var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const ostConfig = require('./config')
const OSTSDK = require('@ostdotcom/ost-sdk-js');
const ostObj = new OSTSDK({apiKey: ostConfig.settings.apiKey, apiSecret: ostConfig.settings.apiSecret, apiEndpoint: ostConfig.settings.ostApiEndpoint});
const actionService = ostObj.services.actions;

// LIST OST ACTIONS
router.get('/', (req, res) => {
  actionService.list({}).then(function(ost_res) { 
    res.status(200).send({ body: JSON.stringify(ost_res) }); 
  }).catch(function(err) { 
     return res.status(500).send("There was a problem listing the OST actions.");; 
  });
});

// GET ACTION
router.get('/:id', (req, res) => {
  actionService.get({id: req.params.id}).then(function(ost_res) { 
    res.status(200).send({ body: JSON.stringify(ost_res) }); 
  }).catch(function(err) { 
     return res.status(500).send("There was a problem finding this OST action.");; 
  });
});


module.exports = router;