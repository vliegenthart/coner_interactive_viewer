
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { db } from '../firebase';

import Button from '@material-ui/core/Button';
import { map } from 'lodash';
import OstClient from '../ost/ostClient';
import ostSettings from "../ost/ostClientSettings";
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import { arrayToObject } from '../utility/utilFunctions';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CircularProgress from '@material-ui/core/CircularProgress';
import { groupBy } from 'lodash';


import '../style/OstWallet.css'

class OstWallet extends Component {
  constructor(props) {
    super(props);

    this.fetchUserBalance = this.fetchUserBalance.bind(this);
    this.fetchUserLedger = this.fetchUserLedger.bind(this);

    this.state = {
      ledger: null,
      users: null
    };

    this.ost = new OstClient()

  }

  componentDidMount() {
    this.ost.listUsers().then(res => {
      this.setState(() => ({ users: arrayToObject(res) }))
    }
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user } = this.props;
    if (this.props.user && this.props.user.ostUuid && !this.state.ledger) {
      this.fetchUserLedger()
    }
  }

  fetchUserBalance = () => {
    const { user } = this.props;
  }

  fetchUserLedger = () => {
    const { user, actionIds } = this.props;

    this.ost.getUserLedger(user.ostUuid).then(res => {
      const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
      const grouped = groupBy(res.transactions.filter(trans => Object.keys(actionIds[trans['action_id']].walletMessage).length > 0), x => new Date(x.timestamp).toLocaleDateString('en-US', options))
      console.log(grouped)
      this.setState(() => ({ ledger: grouped }))
    });
  }

  render() {
    const { ledger, users } = this.state;
    const { actionIds, user } = this.props;

    return (
      <div className="Ost__wallet">
        <TransactionList ledger={ledger} user={user} actionIds={actionIds} users={users}></TransactionList>
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
    const { users, actionIds, user } = this.props;

    const action = actionIds[trans['action_id']]
    let ele = '';
    let icon = ''
    let walletMessage = ''
    let transInfo = ''
    let type ='received'

    if (action.kind === 'company_to_user') {
      icon = <BeachAccessIcon />
      transInfo = `From Coner Company - ${new Date(trans.timestamp).toLocaleTimeString()}`
    } else {
      if(trans.from_user_id === user.ostUuid) {
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
        <Paper className="Transaction_wrapper" elevation={1}>
          <div className={`Icon__wrapper ${type}`}>
            {icon}
          </div>
          
          <Typography className="Transaction__message" variant="headline" component="p">
            {walletMessage.verb} {parseFloat(trans.amount).toFixed()} CNR {walletMessage.actionText && `(${walletMessage.actionText})`}
          </Typography>
          <Typography className="Transaction__info" component="p">
            {transInfo}
          </Typography>
        </Paper>     
      </li>
    )
  }

  render() {
    const { ledger, actionIds, users, onClick } = this.props;

    return (
      <div className="Transaction__list">
        <h3>CNR Transactions</h3>
        
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

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(OstWallet);

