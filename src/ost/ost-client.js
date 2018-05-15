import OstKit from './ost-kit'
import config from "./config"
import { db } from '../firebase';
import { getNextId } from '../utility/util-functions'

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
    console.error("OSTError: ", e)
  });
}

export function rewardUser(user, pid, transactionKind="RewardRating") {
  ok.transactiontypesExecute({from_uuid: config.companyUuid, to_uuid: user.ostUuid, transaction_kind: transactionKind}).then((res) => {  
    if (config.devMode) console.log(`Rewarded OST user ${user.username} with transaction type "${transactionKind}"`)
    
    createReward(res, pid);
    
  }).catch((e) => {
    console.error("OSTError: ", e)
  });
}

export function airdropNewUsers(amount) {
  ok.usersAirdropDrop({amount: amount, list_type: "never_airdropped"}).then((res) => {
    console.log(res)
  }).catch((e) => {
    console.error("OSTError: ", e)
  });
}

export function airdropAllUsers(amount) {
  ok.usersAirdropDrop({amount: amount, list_type: "all"}).then((res) => {
    console.log(res)
  }).catch((e) => {
    console.error("OSTError: ", e)
  });
}

export function createReward(ost_trans, pid="create_user") {
  const timestamp = Math.round((new Date()).getTime() / 1000)
  const reward = ({ ...ost_trans, pid: pid, timestamp: timestamp }) 
  const id = getNextId()

  db.doCreateReward(id, reward)
  .then(data => {
    if (config.devMode) console.log(`Added reward (id: ${id}) to Firebase database`)
  })
  .catch(error => {
    console.log('Error:', error);
  });
}

// createUser("John Doe")
// rewardUser("d086778f-fc7d-4d07-a515-0a90403a4a6d", "Reward")
