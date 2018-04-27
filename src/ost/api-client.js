const queryString = require('query-string');
const crypto = require('crypto');
const request = require('request')
const config = require("./config")
const OstKit = require('./ost-kit');

var ok = new OstKit(config.apiKey, config.apiSecret);

function listUsers() {
  ok.usersList().then((res) => {
    console.log(res)
  });
}

function listTransactionTypes() {
  ok.transactiontypesList().then((res) => {
    console.log(res)
  });
}

function createUser(name) {
  ok.usersCreate({name: name}).then((res) => {
    console.log(res)
  }).catch((e) => {
    console.log("Err", e.response.data.err)
  });
}

function rewardUser(to_uuid, transaction_kind) {
  ok.transactiontypesExecute({from_uuid: config.company_uuid, to_uuid: to_uuid, transaction_kind: transaction_kind}).then((res) => {
    console.log(res)
  }).catch((e) => {
    console.log("Err", e.response.data.err)
  });
}

function airdropNewUsers(amount) {
  ok.usersAirdropDrop({amount: amount, list_type: "never_airdropped"}).then((res) => {
    console.log(res)
  }).catch((e) => {
    console.log("Err", e.response.data.err)
  });
}

function airdropAllUsers(amount) {
  ok.usersAirdropDrop({amount: amount, list_type: "all"}).then((res) => {
    console.log(res)
  }).catch((e) => {
    console.log("Err", e.response.data.err)
  });
}

// createUser("John Doe")
// rewardUser("d086778f-fc7d-4d07-a515-0a90403a4a6d", "Reward")