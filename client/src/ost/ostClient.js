import OstKit from './ost-kit';
import config from './config';
import { db } from '../firebase';
import { getNextId } from '../utility/utilFunctions';
import { getApi, postApi } from '../utility/apiWrapper'

const ok = new OstKit(config.apiKey, config.apiSecret, config.ostApiEndpoint);

// USER FUNCTIONS
export const listUsers = () => {
  getApi('/api/v1/ost/users')
    .then(res => {
      const users = JSON.parse(res.body).data.users
      return users
    })
    .catch(err => console.log(err));
}

export const createUser = async (name) => {
  return postApi('/api/v1/ost/users', {name: name })  
}

export const getUser = (id) => {
  return getApi('/api/v1/ost/users/' + id)
    .then(res => {
      const user = JSON.parse(res.body).data.user
      return user
    })
    .catch(err => console.log(err));
}

export function rewardUser(user, pid, transactionKind="RewardRating") {
  ok.transactiontypesExecute({from_uuid: config.companyUuid, to_uuid: user.ostUuid, transaction_kind: transactionKind}).then((res) => {  
    if (config.devMode) console.log(`Rewarded OST user ${user.username} with transaction type "${transactionKind}"`)
    
    createReward(res, pid);
    
  }).catch((e) => {
    console.error("OSTError: ", e)
  });
}

export function listTransactionTypes() {
  ok.transactiontypesList().then((res) => {
    console.log(res)
  });
}



export function transactiontypesStatus(transaction_uuids=[], callback) {
  ok.transactiontypesStatus({transaction_uuids}).then(callback).catch((e) => {
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
    if (config.devMode) console.log(`Added reward (id: ${id}) to Firebase database`, reward)
  })
  .catch(error => {
    console.log('Error:', error);
  });
}

// createUser("John Doe")
// rewardUser("d086778f-fc7d-4d07-a515-0a90403a4a6d", "Reward")
