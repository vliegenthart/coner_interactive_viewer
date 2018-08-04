var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


const ostConfig = require('./config')
const OSTSDK = require('@ostdotcom/ost-sdk-js');
const ostObj = new OSTSDK({apiKey: ostConfig.settings.apiKey, apiSecret: ostConfig.settings.apiSecret, apiEndpoint: ostConfig.settings.ostApiEndpoint});
const userService = ostObj.services.users;

// LIST ALL OST USERS
router.get('/', (req, res) => {
  userService.list({ limit: 100 }).then(function(ost_res) { 
    res.status(200).send({ body: JSON.stringify(ost_res) }); 

  }).catch(function(err) { 
     return res.status(500).send("There was a problem finding the OST users.");; 
  });
});

// GET OST USER
router.get('/:id', (req, res) => {
  userService.get({id: req.params.id}).then(function(ost_res) { 
    res.status(200).send({ body: JSON.stringify(ost_res) }); 
  }).catch(function(err) { 
     return res.status(500).send("There was a problem finding this OST user.");; 
  });
});

// CREATE NEW OST USER
router.post('/', (req, res) => {
  userService.create({name: req.body.name}).then(function(ost_res) { 
    res.status(200).send({'body': JSON.stringify(ost_res)});
  }).catch(function(err) { 
    res.status(500).send("There was a problem creating this OST user.");
  });
});

module.exports = router;