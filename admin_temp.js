
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { db } from '../firebase';
import termHighlights from "../highlights/term-highlights";

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { map } from 'lodash';
import { snapshotToArray } from '../utility/utilFunctions';
import OstClient from '../ost/ostClient';
import ostSettings from "../ost/ostClientSettings";
import sortBy from 'lodash/sortBy';

import "../style/Admin.css";

class AdminPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: null,
      ostTransactions: {},
    };

    this.ost = new OstClient()

    this.syncLocalHighlights = this.syncLocalHighlights.bind(this);
    this.deleteFirebaseHighlights = this.deleteFirebaseHighlights.bind(this);
    this.fetchOstTransactions = this.fetchOstTransactions.bind(this);
    this.airdropTokensCC = this.airdropTokensCC.bind(this);
    this.checkCCBalances = this.checkCCBalances.bind(this);

  }

  componentDidMount() {
    db.onceGetUsers().then(snapshot =>
      this.setState(() => ({ users: snapshot.val() }))
    );

    this.fetchOstTransactions()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.users === null && this.state.users) {
      this.checkCCBalances()
    }
  }

  // Ensure content creators have minimum of CNR tokens available to receive feedback
  checkCCBalances = () => {
    const { users } = this.state;

    Object.keys(users).map(key => {
      const user = users[key]

      if (ostSettings.contentCreators.includes(user.ostUuid)) {
        this.ost.getUserBalance(user.ostUuid).then(res => {
          if (parseInt(res.available_balance) < ostSettings.minCCTokens) {
            this.airdropTokensCC(user)
          }
        });
      }
    });
  }

  syncLocalHighlights() {

    // To reset highlights: Only remove highlights with highlight.metadata.type = "generated", to not remove custom selected highlights
    console.log("Syncing highlights...")

    for (const highlight of termHighlights) {
      db.onceGetHighlight(highlight.pid, highlight.id).then((snapshot) => {
        const dbHighlight = snapshot.val()

        // If highlight hasn't been imported
        if (!dbHighlight) db.doCreateHighlight(highlight.id, highlight)
      })
      .catch(error => {
        console.log('Error:', error);
      });
    }

    console.log("Finished syncing highlights")

  }

  deleteFirebaseHighlights() {
    console.log("Deleting Firebase highlights...")
    
    db.onceDeleteHighlights().then(res => {
      console.log("Finished deleting Firebase highlights")
    }) 
    .catch(error => {
      console.log('Error:', error);
    });
  }

  deleteFirebaseHighlights() {
    console.log("Deleting Firebase highlights...")
    
    db.deleteHighlights().then(res => {
      console.log("Finished deleting Firebase highlights")
    }) 
    .catch(error => {
      console.log('Error:', error);
    });
  }


  deleteFirebaseRatings() {
    console.log("Deleting Firebase ratings...")
    
    db.deleteRatings().then(res => {
      console.log("Finished deleting Firebase ratings")
    }) 
    .catch(error => {
      console.log('Error:', error);
    });
  }

  deleteFirebaseRewards() {
    console.log("Deleting Firebase rewards...")
    
    db.deleteRewards().then(res => {
      console.log("Finished deleting Firebase rewards")
    }) 
    .catch(error => {
      console.log('Error:', error);
    });
  }

  airdropTokensCC(toUser) {
    this.ost.transactionCompanyToUser(toUser, "AirdropCC", 'AirdropCC').then(ostRes => {
      console.log(`Airdropped CNR tokens to ${toUser.username}`)
    }).catch((e) => {
      console.error("OSTError: ", e)
    });
  }


  fetchOstTransactions() {
    let { papers } = this.props;

    papers = [...Array.from(papers, paper => paper.pid)];
    const _this = this;

    map(papers, function(pid){
      db.onceGetRewards(pid)
        .then((snapshot) => {
          const rewards = snapshot.val() ? snapshotToArray(snapshot.val()) : []
          if (rewards.length > 0) {
            const transaction_uuids = map(rewards, function(reward) { return reward.transaction_uuid})

            setTimeout(() => { 
              _this.ost.transactiontypesStatus(transaction_uuids, (res) => {
                if (ostSettings.devMode) {
                  console.log(`Fetched statuses for ${transaction_uuids.length} transactions`, res)
                }
                res.transactions = sortBy(res.transactions, 'transaction_timestamp', ).reverse().slice(0,20);
                _this.setState({ ostTransactions: { [pid]: res, ..._this.state.ostTransactions }});
              })
            }, 500);
          }
        })
        .catch(error => {
          console.log('Error:', error);
        });
    });

  }

  render() {
    const { users, ostTransactions } = this.state;

    return (
      <div className="Admin__container">
        <Grid container spacing={24} alignItems="center" direction="row" justify="center">
          <Grid item xs={11}>
            <Paper className="Basic__paper">
              <h1>Admin Page</h1>
              { !!users && <UserList users={users} onClick={this.airdropTokensCC} /> }

              <h3>Firebase Interaction</h3>
              <Button className="Submit__button" onClick={() => this.syncLocalHighlights() } variant="raised">
                Sync Local Highlights with Firebase Database
              </Button> <br />

              <Button className="Submit__button is-red" onClick={() => this.deleteFirebaseHighlights() } variant="raised">
                Remove all highlights from Firebase Database
              </Button> <br />
              
              <Button className="Submit__button is-red" onClick={() => this.deleteFirebaseRatings() } variant="raised">
                Remove all ratings from Firebase Database
              </Button> <br />

              <Button className="Submit__button is-red" onClick={() => this.deleteFirebaseRewards() } variant="raised">
                Remove all OST rewards from Firebase Database
              </Button> <br />

              <h3>OST Transactions</h3>

              {map(this.props.papers, (paper) => {
                return (
                  <div key={paper.pid}>
                    <h5>{paper.title}</h5>

                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Transaction Hash</TableCell>
                          <TableCell>Transaction Type</TableCell>
                          <TableCell>Timestamp</TableCell>
                        </TableRow>
                      </TableHead>
                      {ostTransactions[paper.pid] &&
                        <TableBody>
                          {ostTransactions[paper.pid] && map(ostTransactions[paper.pid]['transactions'], trans => {
                            return (
                              <TableRow key={trans.id}>
                                <TableCell component="th" scope="row">
                                  <a href={ostSettings.viewerBaseUrl + trans.transaction_hash}>{trans.transaction_hash}</a>
                                </TableCell>
                                <TableCell>
                                {ostTransactions[paper.pid]['transaction_types'][trans.transaction_type_id]['name']}
                                </TableCell>
                                <TableCell>{new Date(trans.transaction_timestamp).toUTCString()}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      }
                    </Table>
                  </div>
                )
              })}
            </Paper>
          </Grid>
        </Grid>
      </div>
        
    );
  }
}

const UserList = ({ users, onClick }) =>
  <div>
    <h3>List of Usernames of Firebase Users</h3>

    <ul>
    {Object.keys(users).map(key =>
      <li key={key}>{users[key].username}{users[key].ostUuid && ostSettings.contentCreators.includes(users[key].ostUuid) && (
        <Button className="Submit__button" onClick={() => onClick(users[key]) } variant="raised">
          Airdrop Tokens to Content Creator
        </Button> 
      )}</li>
    )}
    </ul>
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(AdminPage);