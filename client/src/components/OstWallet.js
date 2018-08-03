
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { db } from '../firebase';

import Button from '@material-ui/core/Button';
import { map } from 'lodash';
import OstClient from '../ost/ostClient';
import ostSettings from "../ost/ostClientSettings";
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';

class OstWallet extends Component {
  constructor(props) {
    super(props);

    this.fetchUserBalance = this.fetchUserBalance.bind(this);
    this.fetchUserLedger = this.fetchUserLedger.bind(this);

    this.state = {
      ledger: null
    };

    this.ost = new OstClient()

    this.actionNames = {}

    this.ost.listActions().then(res => {
      this.actionNames = res;
      console.log(res)
    });
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
      console.log(res)
      this.setState(() => ({ ledger: res }))
    });
  }

  render() {
    const { ledger } = this.state;
    const { actionNames } = this.props;
    console.log(actionNames)

    return (
      <div className="Ost__wallet">
        <TransactionList ledger={ledger}></TransactionList>
      
      </div>
        
    );
  }
}

const TransactionList = ({ ledger, onClick }) =>
  <div>
    <h3>List of Transactions</h3>

    <ul>
    {ledger && ledger.transactions.map(trans =>
      <li key={trans.id}>{trans.action_id} - {new Date(trans.timestamp).toLocaleTimeString()}</li>
    )}
    </ul>
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(OstWallet);