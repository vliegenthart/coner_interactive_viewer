import OstKit from './ost-kit'
import config from "./config"

var ok = new OstKit(config.apiKey, config.apiSecret, config.ostApiEndpoint);

export function listUsers() {
  ok.usersList().then((res) => {
    console.log(res)
  });
}

export function listTransactionTypes() {
  ok.transactiontypesList().then((res) => {
    console.log(res)
  });
}

export function createUser(name, callback) {
  ok.usersCreate({name: name}).then(callback)
  .catch((e) => {
    console.log("Err", e)
  });
}

export function rewardUser(user, transactionKind="RewardRating") {
  ok.transactiontypesExecute({from_uuid: config.companyUuid, to_uuid: user.ostUuid, transaction_kind: transactionKind}).then((res) => {  
    console.log(`Rewarded OST user ${user.username} with transaction type "${transactionKind}"`)
    // console.log(res) 
  }).catch((e) => {
    console.log("Err", e)
  });
}

export function airdropNewUsers(amount) {
  ok.usersAirdropDrop({amount: amount, list_type: "never_airdropped"}).then((res) => {
    console.log(res)
  }).catch((e) => {
    console.log("Err", e)
  });
}

export function airdropAllUsers(amount) {
  ok.usersAirdropDrop({amount: amount, list_type: "all"}).then((res) => {
    console.log(res)
  }).catch((e) => {
    console.log("Err", e)
  });
}

// createUser("John Doe")
// rewardUser("d086778f-fc7d-4d07-a515-0a90403a4a6d", "Reward")