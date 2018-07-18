// https://medium.freecodecamp.org/how-to-make-create-react-app-work-with-a-node-backend-api-7c5c48acb1b0

const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

const ostConfig = require('./server/ost/config.js')
const OSTSDK = require('@ostdotcom/ost-sdk-js');

const ostObj = new OSTSDK({apiKey: ostConfig.settings.apiKey, apiSecret: ostConfig.settings.apiSecret, apiEndpoint: ostConfig.settings.ostApiEndpoint});
const userService = ostObj.services.users;

app.get('/api/users', (req, res) => {
  userService.list({}).then(function(ost_res) { 
    // console.log(JSON.stringify(ost_res))
    // console.log(JSON.stringify(ost_res))
    res.send({ users: JSON.stringify(ost_res) }); 

  }).catch(function(err) { console.log(JSON.stringify(err)); });

  // res.send({ users: 'Hello From Express' });

});

app.listen(port, () => console.log(`Listening on port ${port}`));