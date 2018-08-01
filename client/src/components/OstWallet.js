
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { db } from '../firebase';

import Button from '@material-ui/core/Button';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import { map } from 'lodash';
import OstClient from '../ost/ostClient';
import ostSettings from "../ost/ostClientSettings";
import sortBy from 'lodash/sortBy';

class OstWallet extends Component {
  constructor(props) {
    super(props);

    this.fetchUserBalance = this.fetchUserBalance.bind(this);
    this.fetchUserLedger = this.fetchUserLedger.bind(this);

    this.state = {
      ledger: []
    };

    this.ost = new OstClient()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user } = this.props;
    if ((!isEqual(prevProps.user, this.props.user)) && this.props.user && this.props.user.ostUuid) {
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
    const { ledger } = this.state;

    return (
      <div className="Ost__wallet">
        <TransactionList transactions={ledger.transactions}></TransactionList>
      </div>
        
    );
  }
}

const TransactionList = ({ transactions, onClick }) =>
  <div>
    <h3>List of Transactions</h3>

    <ul>
    {transactions.map(trans =>
      <li>YOO</li>
    )}
    </ul>
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(OstWallet);