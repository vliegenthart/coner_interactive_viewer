
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { db } from '../firebase';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import { map } from 'lodash';
import OstClient from '../ost/ostClient';
import ostSettings from "../ost/ostClientSettings";
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import { arrayToObject, removeDuplicates } from '../utility/utilFunctions';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CircularProgress from '@material-ui/core/CircularProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { groupBy } from 'lodash';
import Chip from '@material-ui/core/Chip';
import PaymentIcon from '@material-ui/icons/Payment';
import Avatar from '@material-ui/core/Avatar';

import '../style/OstWallet.css'

class OstWallet extends Component {
  constructor(props) {
    super(props);

    this.fetchUserBalance = this.fetchUserBalance.bind(this);
    this.fetchUserLedger = this.fetchUserLedger.bind(this);
    this.setCachedGiftAmount = this.setCachedGiftAmount.bind(this);

    this.state = {
      ledger: null,
      users: null,
      usersArr: null,
      cachedGiftAmount: 20,
      tokenBalance: 0
    }

    this.ost = new OstClient()

  }

  componentDidMount() {
    this.ost.listUsers().then(res => {
      let tempUsers = res.slice(0,17)
      tempUsers = removeDuplicates(sortBy(tempUsers, 'name'), 'name').filter(obj => obj['name'].length > 0)
      this.setState(() => ({ users: arrayToObject(tempUsers), usersArr: tempUsers }))
    });
    this.fetchUserBalance(this.props.user)

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user } = this.props;
    if (this.props.user && (this.props.user.ostUuid || this.props.user.id) && !this.state.ledger) {
      this.fetchUserLedger()
    }
  }
  setCachedGiftAmount = (amount) => {
    this.setState(() => ({ cachedGiftAmount: amount, tokenBalance: parseFloat(this.state.tokenBalance) - amount }))
  }

  fetchUserBalance = (user) => {
    let userId = Object.keys(user).includes('ostUuid') ? user.ostUuid : user.id
    this.ost.getUserBalance(userId).then(res => {
      this.setState(() => ({ tokenBalance: res.token_balance }))
    })
  }

  fetchUserLedger = () => {
    const { user, actionIds } = this.props;

    let userId = Object.keys(user).includes('ostUuid') ? user.ostUuid : user.id

    this.ost.getUserLedger(userId).then(res => {
      const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
      if (res.length === 0) return

      const grouped = groupBy(res.transactions.filter(trans => Object.keys(actionIds[trans['action_id']].walletMessage).length > 0 && trans.from_user_id !== trans.to_user_id), x => new Date(x.timestamp).toLocaleDateString('en-US', options))
      this.setState(() => ({ ledger: grouped }))
    });
  }

  render() {
    const { ledger, users, usersArr, cachedGiftAmount, tokenBalance } = this.state;
    const { actionIds, user, pid, showGift } = this.props;

    return (
      <div className="Ost__wallet">
        {users && showGift && <GiftPaper users={users} usersArr={usersArr} user={user} pid={pid} fetchUserLedger={this.fetchUserLedger} setAmount={this.setCachedGiftAmount} />}

        <TransactionList tokenBalance={tokenBalance} showGift={showGift} ledger={ledger} user={user} actionIds={actionIds} users={users} cachedGiftAmount={cachedGiftAmount} ></TransactionList>
      </div>
        
    );
  }
}

class TransactionList extends Component {
  constructor(props) {
    super(props);

    this.renderTransaction = this.renderTransaction.bind(this);

  }

  renderTransaction = trans => {
    const { users, actionIds, user, cachedGiftAmount } = this.props;

    const action = actionIds[trans['action_id']]
    let ele = '';
    let icon = ''
    let walletMessage = ''
    let transInfo = ''
    let type ='received'

    let fromUserId = Object.keys(user).includes('ostUuid') ? user.ostUuid : user.id

    if (action.kind === 'company_to_user') {
      icon = <BeachAccessIcon />
      transInfo = `From Coner Company - ${new Date(trans.timestamp).toLocaleTimeString()}`
    } else {
      if(trans.from_user_id === fromUserId) {
        icon = <ArrowUpwardIcon />
        type = 'sent'
        walletMessage = action['walletMessage'].sent
        transInfo =  `To ${(users[trans['to_user_id']] && users[trans['to_user_id']].name)} - ${new Date(trans.timestamp).toLocaleTimeString()}`
      } else {
        icon = <ArrowDownwardIcon />
        walletMessage = action['walletMessage'].received
        transInfo = `From ${(users[trans['from_user_id']] && users[trans['from_user_id']].name)} - ${new Date(trans.timestamp).toLocaleTimeString()}`
      }
    }

    return(
      <li key={trans.id}>
        <a href={ostSettings.viewerBaseUrl + trans.transaction_hash} target="_blank">
          <Paper className="Transaction_wrapper" elevation={1}>
            <div className={`Icon__wrapper ${type}`}>
              {icon}
            </div>
            
            <Typography className="Transaction__message" variant="headline" component="p">
              {walletMessage.verb} {trans.amount ? parseFloat(trans.amount).toFixed() : parseFloat(cachedGiftAmount).toFixed() } CNR {walletMessage.actionText && `(${walletMessage.actionText})`}
            </Typography>
            <Typography className="Transaction__info" component="p">
              {transInfo}
            </Typography>
          </Paper>  
        </a>   
      </li>
    )
  }

  render() {
    const { ledger, actionIds, users, onClick, showGift, user, tokenBalance } = this.props;

    return (
      <div className="Transaction__list">
        <h3>CNR Transactions</h3>

        <Chip className="tokenBalance Balance__chip" label={parseFloat(tokenBalance).toFixed() + " CNR"} avatar={
              <Avatar>
                <PaymentIcon />
              </Avatar>
            }/>
        
        { (users && ledger) ? (Object.keys(ledger).map(group =>
          <div className="Date__wrapper" key={group}>
            <div className="Ledger__date">{group}</div>
            <ul>
              { ledger[group].map(trans => 
                this.renderTransaction(trans)
                
              )}
            </ul>
          </div>
        )): (<div className="Progress__wrapper"><CircularProgress /></div>)}   
      </div>
    )
  }
}

class GiftPaper extends Component {
  constructor(props) {
    super(props);

    this.handleUserchange = this.handleUserChange.bind(this);

    this.state = {
      dropdownUser: null,
      usersArr: null,
      amount: 20
    }

    this.ost = new OstClient()

  }

  componentDidMount() {
    const { users, usersArr } = this.props;

    this.setState(() => ({usersArr: usersArr, dropdownUser: usersArr[0].id}))
  }


  handleUserChange = (event) => {
    this.setState(() => ({ dropdownUser: event.target.value }))
  }

  onSubmit = (event) => {
    const { usersArr, dropdownUser, amount } = this.state;
    const { users, user, pid, fetchUserLedger, setAmount } = this.props;

    event.preventDefault();
    this.setState(() => ({dropdownUser: usersArr[0].id, amount: 20}))
    setAmount(amount)

    this.ost.transactionUserToUser(user, users[dropdownUser], pid, 'SendGift', amount).then(res => {
      
      setTimeout(() => { 
        fetchUserLedger()
      }, 500);
    })
  }

  render() {
    const { dropdownUser, usersArr, amount } = this.state;

    return (
      usersArr &&
        <Paper className="Gift__paper" elevation={1}>
          <Typography className="Gift__title" variant="headline" component="h4">
            Send CNR tokens to friends
          </Typography>

          <form onSubmit={this.onSubmit}>

            <FormControl className="FormControl">
              <InputLabel htmlFor="select-user">User</InputLabel>

              <Select
                className={`user-select`}
                value={dropdownUser}
                onChange={event =>  this.handleUserChange(event)}
                inputProps={{
                  name: 'id',
                  id: 'select-user',
                }}
              >
                {usersArr.map(_user => 
                  <MenuItem key={_user['id']} value={_user['id']}>{_user['name']}</MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl className="FormControl Input__cnr-amount">
              <InputLabel htmlFor="cnr-amount">CNR Amount</InputLabel>
              <Input id="cnr-amount" type="number" value={amount} onChange={event => this.setState({ amount: event.target.value })} />
            </FormControl>

            <Button className="Submit__button" type="submit" variant="raised" color="primary">
              Send Gift
            </Button>
          </form>

        </Paper>
      
    )
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(OstWallet);

