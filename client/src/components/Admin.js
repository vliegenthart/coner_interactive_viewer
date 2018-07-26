
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
    this.fetchOstTransactions = this.fetchOstTransactions.bind(this);

  }

  componentDidMount() {
    db.onceGetUsers().then(snapshot =>
      this.setState(() => ({ users: snapshot.val() }))
    );

    this.fetchOstTransactions()
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
              { !!users && <UserList users={users} /> }

              <h3>Sync Highlights</h3>
              <Button className="Submit__button" onClick={() => this.syncLocalHighlights() } varian="raised">
                Sync Local Highlights with Firebase Database
              </Button>

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

const UserList = ({ users }) =>
  <div>
    <h3>List of Usernames of Firebase Users</h3>

    <ul>
    {Object.keys(users).map(key =>
      <li key={key}>{users[key].username} - {process.env.NODE_ENV === 'development' &&  users[key].ostUuid}</li>
    )}
    </ul>
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(AdminPage);