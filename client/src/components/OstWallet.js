
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
      const grouped = groupBy(res.transactions.filter(trans => actionIds[trans['action_id']].walletMessage), x => new Date(x.timestamp).toLocaleDateString('en-US', options))
      this.setState(() => ({ ledger: grouped }))
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
    <h3>CNR Transactions</h3>
    
    { users && ledger && (Object.keys(ledger).map(group =>
      <div className="Date__wrapper" key={group}>
        <div class="Ledger__date">{group}</div>
        <ul>
          { ledger[group].map(trans => 
            <li key={trans.id}>
              <Paper className="Transaction_wrapper" elevation={1}>
                <div className="Icon__wrapper">
                  { actionIds[trans['action_id']].kind === 'company_to_user' &&
                    <BeachAccessIcon/>
                  }
                </div>
                
                <Typography className="Transaction__message" variant="headline" component="p">
                  {actionIds[trans['action_id']].walletMessage && actionIds[trans['action_id']].walletMessage.verb} {parseFloat(trans.amount).toFixed()} CNR {actionIds[trans['action_id']].walletMessage.actionText && `(${actionIds[trans['action_id']].walletMessage.actionText})`}          </Typography>
                <Typography className="Transaction__info" component="p">
                  From {actionIds[trans['action_id']].kind === 'company_to_user' ? 'Coner Company' : (users[trans['from_user_id']] && users[trans['from_user_id']].name)} - {new Date(trans.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>     
            </li>
          )}
        </ul>
      </div>
      ))
    }
    
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(OstWallet);

