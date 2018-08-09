
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { db } from '../firebase';
import OstWallet from './OstWallet';
import termHighlights from "../highlights/term-highlights";
import config from './config'

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { map } from 'lodash';
import { snapshotToArray, arrayToObject, removeDuplicates } from '../utility/utilFunctions';
import OstClient from '../ost/ostClient';
import ostSettings from "../ost/ostClientSettings";
import sortBy from 'lodash/sortBy';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import Avatar from '@material-ui/core/Avatar';


import "../style/Admin.css";

class AdminPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: null,
      usersArr: null,
      ostTransactions: {},
    };

    this.ost = new OstClient()

    this.syncLocalHighlights = this.syncLocalHighlights.bind(this);
    this.deleteFirebaseHighlights = this.deleteFirebaseHighlights.bind(this);
    // this.fetchOstTransactions = this.fetchOstTransactions.bind(this);
    this.airdropTokensCC = this.airdropTokensCC.bind(this);
    this.checkCCBalances = this.checkCCBalances.bind(this);
  }

  componentDidMount() {
    this.ost.listUsers().then(res => {
      let tempUsers = res.slice(0,15)
      tempUsers = removeDuplicates(sortBy(tempUsers, 'name'), 'name').filter(obj => obj['name'].length > 0)
      this.setState(() => ({ users: arrayToObject(tempUsers), usersArr: tempUsers }))
    });

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.usersArr === null && this.state.usersArr) {
      this.checkCCBalances()
    }
  }

  // Ensure content creators have minimum of CNR tokens available to receive feedback
  checkCCBalances = () => {
    const { users, usersArr } = this.state;

    usersArr.map(user => {
      let userId = Object.keys(user).includes('ostUuid') ? user.ostUuid : user.id

      if (ostSettings.contentCreators.includes(userId)) {
        this.ost.getUserBalance(userId).then(res => {
          if (parseInt(res.available_balance) < ostSettings.minCCTokens) {
            console.log(user)
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
      console.log(`Airdropped CNR tokens to ${toUser.name}`)
    }).catch((e) => {
      console.error("OSTError: ", e)
    });
  }


  // fetchOstTransactions() {
  //   let { papers } = this.props;

  //   papers = [...Array.from(papers, paper => paper.pid)];
  //   const _this = this;

  //   map(papers, function(pid){
  //     db.onceGetRewards(pid)
  //       .then((snapshot) => {
  //         const rewards = snapshot.val() ? snapshotToArray(snapshot.val()) : []
  //         if (rewards.length > 0) {
  //           const transaction_uuids = map(rewards, function(reward) { return reward.transaction_uuid})

  //           setTimeout(() => { 
  //             _this.ost.transactiontypesStatus(transaction_uuids, (res) => {
  //               if (ostSettings.devMode) {
  //                 console.log(`Fetched statuses for ${transaction_uuids.length} transactions`, res)
  //               }
  //               res.transactions = sortBy(res.transactions, 'transaction_timestamp', ).reverse().slice(0,20);
  //               _this.setState({ ostTransactions: { [pid]: res, ..._this.state.ostTransactions }});
  //             })
  //           }, 500);
  //         }
  //       })
  //       .catch(error => {
  //         console.log('Error:', error);
  //       });
  //   });
  // }

  render() {
    const { users, usersArr, ostTransactions } = this.state;
    const { actionIds } = this.props;

    return (
      <div className="Admin__container">
        <Grid container spacing={24} alignItems="center" direction="row" justify="center">
          <Grid item xs={10}>
              <div className="Admin__title">
              <h1>Admin Page</h1>
              </div>
          </Grid>
          <Grid item xs={5} className="sideBySide__gridItem">
              <h3>User Ost Wallets</h3>
              { !!users && <UserWallets usersArr={usersArr} actionIds={actionIds} /> }
          </Grid>
          <Grid item xs={5} className="sideBySide__gridItem">
          
            <h3>Content Creator Budget Pools</h3>
            <Paper className="Admin__gridPaper">
               { !!users && <ContentCreators onclick={this.airdropTokensCC} usersArr={usersArr} actionIds={actionIds} /> }
            </Paper>
          </Grid>
          <Grid item xs={10}>
            <Paper className="Admin__gridPaper">
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
            </Paper>
          </Grid>
        </Grid>
        
      </div>
        
    );
  }
}

class UserWallets extends Component {
  constructor(props) {
    super(props);
    this.handleChangeExpanded = this.handleChangeExpanded.bind(this);

    this.state = {
      expanded: null
    };
  }

  handleChangeExpanded = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  render() {
    const { usersArr, actionIds } = this.props;
    const { expanded } = this.state;

    return (
      usersArr.map(user =>
        <ExpansionPanel key={user.id} expanded={expanded === `expanded-${user.id}`} onChange={this.handleChangeExpanded(`expanded-${user.id}`)}>
          <ExpansionPanelSummary className="Wallet__header" expandIcon={<ExpandMoreIcon />}>
            <Typography>{user.name}</Typography> 
            {ostSettings.contentCreators.includes(user.id) && <Chip className="User__chip ContentCreator__chip" label="Content Creator" avatar={
          <Avatar>
            <FaceIcon />
          </Avatar>
        }/>}
            {!ostSettings.contentCreators.includes(user.id) && user.token_balance > 0 && <Chip className="User__chip DocumentEvaluator__chip" label="Document Evaluator" avatar={
          <Avatar>
            <FaceIcon />
          </Avatar>
        }/>}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <OstWallet user={user} actionIds={actionIds} pid={"admin_page"} showGift={false}/>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      )
    )
  }
}

class ContentCreators extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { users, usersArr, onClick } = this.props;
    return (
      <div>

        <ul>
        {usersArr.filter(user => ostSettings.contentCreators.includes(user.id)).map(user =>
            <li key={user.id}>{user.name} {parseFloat(user.token_balance).toFixed()} CNR

              <Button className="Submit__button" onClick={() => onClick(user) } variant="raised">
                Airdrop CNR
              </Button> 
              <h5>Papers</h5>
              <ul>
                {config.finalPapersList.filter(paper => paper.contentCreator === user.id).map(paper =>
                  <li>{paper.title}</li>
                )}
              </ul>
            </li>
        )}
        </ul>
      </div>
    )
  }
}
 

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(AdminPage);