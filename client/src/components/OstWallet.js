
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { db } from '../firebase';

import Button from '@material-ui/core/Button';
import { map } from 'lodash';
import OstClient from '../ost/ostClient';
import ostSettings from "../ost/ostClientSettings";
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import { arrayToObject } from '../utility/utilFunctions'

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
    const { user } = this.props;

    this.ost.getUserLedger(user.ostUuid).then(res => {
      this.setState(() => ({ ledger: res }))
    });
  }

  render() {
    const { ledger, users } = this.state;
    const { actionIds } = this.props;

    return (
      <div className="Ost__wallet">
        <TransactionList ledger={ledger} actionIds={actionIds} users={users}></TransactionList>
      
      </div>
        
    );
  }
}

const TransactionList = ({ ledger, actionIds, users, onClick }) =>
  <div className="Transaction__list">
    <h3>List of Transactions</h3>
    <ul>
    {users && ledger && ledger.transactions.filter(trans => actionIds[trans['action_id']].walletMessage).map(trans =>
      <li key={trans.id}>
        <div>{actionIds[trans['action_id']].walletMessage && actionIds[trans['action_id']].walletMessage.verb} {parseFloat(trans.amount).toFixed()} CNR {actionIds[trans['action_id']].walletMessage.actionText && `(${actionIds[trans['action_id']].walletMessage.actionText})`}</div>
        


        <div>From {actionIds[trans['action_id']].kind === 'company_to_user' ? 'Coner Company' : (users[trans['from_user_id']] && users[trans['from_user_id']].name)} - {new Date(trans.timestamp).toLocaleTimeString()}</div>
      </li>
    )}
    </ul>
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(OstWallet);

