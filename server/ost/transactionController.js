var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const ostConfig = require('./config')
const OSTSDK = require('@ostdotcom/ost-sdk-js');
const ostObj = new OSTSDK({apiKey: ostConfig.settings.apiKey, apiSecret: ostConfig.settings.apiSecret, apiEndpoint: ostConfig.settings.ostApiEndpoint});
const transactionService = ostObj.services.transactions;

// LIST OST TRANSACTIONS
router.get('/', (req, res) => {
  transactionService.list({page_no: 1, limit: 10}).then(function(ost_res) { 
    res.status(200).send({ body: JSON.stringify(ost_res) }); 

  }).catch(function(err) { 
     return res.status(500).send("There was a problem listing the OST transactions.");; 
  });
});

// GET TRANSACTION STATUS
router.get('/:id', (req, res) => {
  transactionService.get({id: req.params.id}).then(function(ost_res) { 
    res.status(200).send({ body: JSON.stringify(ost_res) }); 
  }).catch(function(err) { 
     return res.status(500).send("There was a problem finding this OST transaction.");; 
  });
});

// EXECUTE TRANSACTION
router.post('/execute', (req, res) => {
  console.log(req.body)
  transactionService.execute({from_user_id: req.body.fromUserId, to_user_id: req.body.toUserId, action_id: req.body.actionId, amount: req.body.amount }).then(function(ost_res) { 
    console.log(ost_res)
    res.status(200).send({'body': JSON.stringify(ost_res)});
  }).catch(function(err) { 
    console.log(JSON.stringify(err))
    res.status(500).send("There was a problem creating this OST transaction.");
  });
});

module.exports = router;