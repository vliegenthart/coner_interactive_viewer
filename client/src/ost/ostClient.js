import ostSettings from './ostClientSettings';
import { db } from '../firebase';
import { getNextId } from '../utility/utilFunctions';
import { getApi, postApi } from '../utility/apiWrapper'


let actionNames = {}

class OstClient {
  constructor() {
    this.listActions = this.listActions.bind(this);
    
    this.actionNames = {}
    
    this.listActions().then(res => {
      this.actionNames = res;
    });

  }

  // USER FUNCTIONS
  listUsers = () => {    
    return getApi('/api/v1/ost/users')
      .then(res => {
        if (!ostSettings.ostDevMode) return []

        const users = JSON.parse(res.body).data.users
        return users
      })
      .catch(err => console.log(err));
  }

  createUser = async (name) => {
    return postApi('/api/v1/ost/users', {name: name })  
  }

  getUser = (id) => {
    return getApi('/api/v1/ost/users/' + id)
      .then(res => {
        const user = JSON.parse(res.body).data.user
        return user
      })
      .catch(err => console.log(err));
  }

  // ACTION FUNCTIONS
  listActions = async () => {
    return getApi('/api/v1/ost/actions')
      .then(res => {
        if (ostSettings.ostDevMode) return this.convertActionsToObject(JSON.parse(res.body).data.actions)
      })
      .catch(err => console.log(err));
  }

  convertActionsToObject = (actions) => {
    return actions.reduce((o, action) => ({ ...o, [action.name]: action}), {})
  }

  // TRANSACTION FUNCTIONS
  transactionCompanyToUser = (user, pid, action="CompanyRR") => {
    let toUserId = Object.keys(user).includes('ostUuid') ? user.ostUuid : user.id

    console.log(ostSettings.companyUuid, toUserId, action)


    return this.executeTransaction(ostSettings.companyUuid, toUserId, action).then(ostRes => {
      if (ostSettings.ostDevMode) { console.log(`Rewarded OST user ${user.name || user.username} with transaction type "${action}"`) }
      this.createReward(ostRes, pid);
    }).catch((e) => {
      console.error("OSTError: ", e)
    });
  }
  
  transactionUserToUser = (fromUser, toUser, pid, action="RewardRating", amount=null) => {

    let fromUserId = typeof fromUser === 'object' ? fromUser.ostUuid : fromUser

    let toUserId = Object.keys(toUser).includes('ostUuid') ? toUser.ostUuid : toUser.id
    return this.executeTransaction(fromUserId, toUserId, action, amount).then(ostRes => {
      if (ostSettings.ostDevMode) { console.log(`Rewarded OST user ${toUser.name || toUser.username} with transaction type "${action}"`) }
      this.createReward(ostRes, pid);
    }).catch((e) => {
      console.error("OSTError: ", e)
    });
  }

  executeTransaction = (fromUserId, toUserId, action, amount=null) => {
    if (fromUserId === toUserId) throw new Error('toUser and fromUser cannot be the same!')
    return postApi('/api/v1/ost/transactions/execute', {fromUserId: fromUserId, toUserId: toUserId, actionId: this.actionNames[action].id, amount: amount })  
  }

  // BALANCE FUNCTIONS
  getUserBalance = (userId) => {
    return getApi('/api/v1/ost/balances/' + userId)
      .then(res => {
        return JSON.parse(res.body).data.balance
      })
      .catch(err => console.log(err));
  }

  // LEDGER FUNCTIONS
  getUserLedger = (userId) => {
    return getApi('/api/v1/ost/ledgers/' + userId)
      .then(res => {
        return JSON.parse(res.body).data
      })
      .catch(err => console.log(err));
  }

  listTransactionTypes = () => {
    // ok.transactiontypesList().then((res) => {
    //   console.log(res)
    // });
  }



  transactiontypesStatus = (transaction_uuids=[], callback) => {
    // ok.transactiontypesStatus({transaction_uuids}).then(callback).catch((e) => {
    //   console.error("OSTError: ", e)
    // });
  }

  airdropNewUsers = (amount) => {
    // ok.usersAirdropDrop({amount: amount, list_type: "never_airdropped"}).then((res) => {
    //   console.log(res)
    // }).catch((e) => {
    //   console.error("OSTError: ", e)
    // });
  }

  airdropAllUsers = (amount) => {
    // ok.usersAirdropDrop({amount: amount, list_type: "all"}).then((res) => {
    //   console.log(res)
    // }).catch((e) => {
    //   console.error("OSTError: ", e)
    // });
  }

  createReward = (ost_trans, pid="create_user") => {
    const timestamp = Math.round((new Date()).getTime() / 1000)
    const reward = ({ ...ost_trans, pid: pid, timestamp: timestamp }) 
    const id = getNextId()

    db.doCreateReward(id, reward)
    .then(data => {
      if (ostSettings.ostDevMode) { console.log(`Added reward (id: ${id}) to Firebase database`) }
    })
    .catch(error => {
      console.log('Error:', error);
    });
  }
}

export default OstClient

// createUser("John Doe")
// rewardUser("d086778f-fc7d-4d07-a515-0a90403a4a6d", "Reward")
