// @flow

// Local development react-pdf-annotator: npm link ../../coner_v2/custom_npm_packages/react-pdf-annotator


// TODO
// - Write Highlight import script!
// - Clean up GitHub epo (remove all highlight files)

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import { db, firebase } from '../firebase';
import config from './config'

import Navigation from './Navigation';
import LandingPage from './Landing';
import SignUpPage from './SignUp';
import SignInPage from './SignIn';
import PasswordForgetPage from './PasswordForget';
import PdfViewer from './Viewer';
import AccountPage from './Account';
import AdminPage from './Admin';
import OstSnackbar from './OstSnackbar';
import ostSettings from "../ost/ostClientSettings";

import * as routes from '../constants/routes';
import withAuthentication from './withAuthentication';
import OstClient from '../ost/ostClient';
import isEqual from 'lodash/isEqual';

import { snapshotToArray, getNextId } from '../utility/utilFunctions'
import { getApi, postApi } from '../utility/apiWrapper'


class App extends Component {
  constructor(props) {
    super(props);
    this.setCurrentPaper = this.setCurrentPaper.bind(this);
    this.addRating = this.addRating.bind(this)
    this.getRatingsByPid = this.getRatingsByPid.bind(this);
    this.getRatingsForHighlight = this.getRatingsForHighlight.bind(this);
    this.getRatingsNewestVersion = this.getRatingsNewestVersion.bind(this);
    this.rewardUser = this.rewardUser.bind(this);
    this.setUser = this.setUser.bind(this);

    this.state = {
      pid: config.defaultPaper['pid'],
      contentCreator: config.defaultPaper['contentCreator'],
      papers: config.finalPapersList,
      user: null,    
      authUser: null,
      ratings: [],
      userRatings: [],
      tokenBalance: 0,
      snackbarMessage: '',
      snackbarOpen: false
    }

    this.ost = new OstClient()

    this.actionNames = {}

    this.ost.listActions().then(res => {
      this.actionNames = res;

      for (let action in this.actionNames) {
        if (Object.keys(ostSettings.actionPrettify).includes(action)) {
          this.actionNames[action]['message'] = ostSettings.actionPrettify[action]
        }
      }

      console.log(this.actionNames)
    });

  }

  setCurrentPaper = (pid, paper, uid) => {
    const { user } = this.state;

    const contentCreator = config.papersList.filter((obj) => { return obj['pid']=== paper})[0]['contentCreator']
    this.setState({ [pid]: paper, contentCreator: contentCreator });
    this.getRatingsByPid(paper, uid);

    this.rewardUser(contentCreator, user, "RewardSwitchPaper");
  }

  componentDidMount() {
    firebase.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        setTimeout(() => {
          this.setState(() => ({ authUser }));
          db.onceGetUser(authUser.uid).then(snapshot => {
            const dbUser = snapshot.val()
            const ostUser = this.ost.getUser(dbUser.ostUuid)

            ostUser.then(res => {
              this.ost.getUserBalance(res.id).then(balRes => {
                this.setState(() => ({ tokenBalance: balRes.token_balance }))
              });
              this.setUser({ ...dbUser, uid: authUser.uid, ostAttr: res }, authUser) 

            }); 
          });
        }, 500);
        
      }
      else {
        this.setState(() => ({ authUser: null, user: null }));
      }
    });      
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { pid, user } = this.state
    if ((!prevState.user || !isEqual(prevState.user, this.state.user)) && this.state.user) this.getRatingsByPid(pid, user.uid)
  }

  handleSnackbarClose = () => {
    this.setState(() => ({ snackbarOpen: false }))
  }
  
  refreshTokenBalance = (action) => {
    this.setState(() => ({ tokenBalance: parseInt(this.state.tokenBalance) + parseInt(this.actionNames[action].amount) }))
  }

  setUser(user, authUser=null) {
    if (authUser) {

      this.setState(() =>({user: user, authUser: authUser }));
      this.ost.getUserBalance(user.ostAttr.id).then(balRes => {
        this.setState(() => ({ tokenBalance: balRes.token_balance }))
      });
      return
    }
    this.setState(() =>({ user: null, authUser: null }))
  }

  getRatingsNewestVersion(ratings) {

    // Reduce by concat key by combination of pid, highlightId, uid and facet of rating, filter out all lower version numbers for objects with similar concat keys
    const ratingsNewestVersion = [...ratings.reduce((r, o) => {
      const key = `${o.pid}-${o.entityText}-${o.uid}-${o.facet}`;
      
      let item = r.get(key) || Object.assign({}, o);
      
      if (o.version > item.version) item = o;

      return r.set(key, item);

    }, new Map()).values()];

    return ratingsNewestVersion;
  }

  // Create rating in Firebase database + reward OST user
  addRating(rating, rating2=null) {
    const { user, ratings, userRatings, contentCreator } = this.state;
    const timestamp = Math.round((new Date()).getTime() / 1000)
    const id = getNextId()
    const uid = rating.uid

    rating.timestamp = timestamp

    db.doCreateRating(id, rating)
    .then(data => {
      console.log(`Added rating (id: ${id}) to Firebase database`)
      this.rewardUser(contentCreator, user, "RewardRating")
      const ratings1 = this.getRatingsNewestVersion([{ ...rating, id: id }, ...ratings]);
      const userRatings1 = this.getRatingsNewestVersion([{ ...rating, id: id }, ...userRatings]);

      this.setState(() => ({
        ratings: ratings1,
        userRatings: userRatings1
      }));

      // Also add rating irrelevant for other facet, as 1 entity does usually not belong to both facets
      if (rating2) {
        this.addRating(rating2)
      }
    })
    .catch(error => {
      console.log('Error:', error);
    });
  }

  // Load ratings from firebase database
  getRatingsByPid = (pid: string, uid: string) => {

    db.onceGetRatings(pid)
    .then((snapshot) => {
      let ratings = snapshot && snapshot.val() ? snapshotToArray(snapshot.val()) : []
      ratings = this.getRatingsNewestVersion(ratings);
      if (ratings.length > 0) this.setState(() => ({ ratings: ratings, userRatings: ratings.filter(rating => rating.uid === uid) }));
    })
    .catch(error => {
      console.log('Error:', error);
    });
  }

  getRatingsForHighlight = (pid, highlight, uid) => {
    if (!highlight.content) return []
    const { userRatings } = this.state;

    return userRatings.filter(rating => rating.entityText === highlight.content.text && rating.pid === pid && rating.uid === uid)
  }

  rewardUser = (fromUser, toUser, type) => {
    const { pid } = this.state;

    if (fromUser && toUser && type) {
      try {
        if (!this.state.snackbarOpen) {
          this.setState(() => ({ snackbarOpen: true, snackbarMessage: `Rewarded ${this.actionNames[type].amount} CNR for ${this.actionNames[type].message}`}))
        }

        this.ost.transactionUserToUser(fromUser, toUser, pid, type).then(res => {
          this.refreshTokenBalance(type)
        }).catch(err => console.error(err.message))
      }
      catch (e) {
        console.error(e.message)
      }
      
    }

    // else {
    //   db.onceGetUser(uid).then(snapshot => {
    //     let fbUser = snapshot.val()
    //     this.setState({ user: { ...fbUser, uid } })
    //     this.ost.transactionCompanyToUser(fbUser, pid, type).then(res => {
    //       this.refreshTokenBalance()
    //     })
    //     }
    //   );
    // }
  }

  render() {
    const { pid, papers, user, tokenBalance, contentCreator, snackbarMessage, snackbarOpen } = this.state;

    return(
      <Router>
        <div>
          <Navigation user={user} tokenBalance={tokenBalance} pid={pid} papers={papers} switchPaper={this.setCurrentPaper} />

          <Route exact path={routes.LANDING} render={() => <LandingPage />} />
          <Route exact path={routes.SIGN_UP} render={() => <SignUpPage setUser={this.setUser}/>} />
          <Route exact path={routes.SIGN_IN} render={() => <SignInPage />} />
          <Route exact path={routes.PASSWORD_FORGET} render={() => <PasswordForgetPage />} />
          <Route exact path={routes.VIEWER} render={(props) => <PdfViewer pid={pid} user={user} contentCreator={contentCreator} addRating={this.addRating} getRatingsForHighlight={this.getRatingsForHighlight} rewardUser={this.rewardUser} switchPaper={this.setCurrentPaper}/>} />
          <Route exact path={routes.ACCOUNT} render={() => <AccountPage />} />
          <Route exact path={routes.ADMIN} render={() => <AdminPage papers={papers} />} />
        
          <OstSnackbar message={snackbarMessage} open={snackbarOpen} handleClose={this.handleSnackbarClose}/>
        </div>
      </Router>
    )
  }
}
  

export default withAuthentication(App);
