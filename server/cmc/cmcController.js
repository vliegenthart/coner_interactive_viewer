var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Coinmarketcap = require('node-coinmarketcap-api');
const cmc = new Coinmarketcap();

// GET OST USER
router.get('/:ticker', (req, res) => {
  cmc.ticker(req.params.ticker, 'EUR').then(function(cmcRes) { 
    res.status(200).send({ body: JSON.stringify(cmcRes) }); 
  }).catch(function(err) { 
     return res.status(500).send("There was a problem fetching this coin from CMC.");; 
  });
});

module.exports = router;