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

import * as routes from '../constants/routes';
import withAuthentication from './withAuthentication';
import * as ost from '../ost/ost-client';
import isEqual from 'lodash/isEqual';

import { snapshotToArray, getNextId } from '../utility/util-functions'

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
      papers: config.papersList,
      user: null,    
      authUser: null,
      ratings: [],
      userRatings: []
    }
  }

  setCurrentPaper = (pid, paper, uid) => {
    const { user } = this.state;

    this.setState({ [pid]: paper });
    this.getRatingsByPid(paper, uid);
    this.rewardUser(user, uid, "RewardSwitchPaper");
  }

  componentDidMount() {
    firebase.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.setState(() => ({ authUser }));
        db.onceGetUser(authUser.uid).then(snapshot => {
          this.setState({ user: { ...snapshot.val(), uid: authUser.uid } })
          }
        );
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

  setUser(user, authUser=null) {
    if (authUser) return this.setState(() =>({user: user, authUser: authUser }))
    this.setState(() =>({ user: user }))
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
  addRating(rating) {
    const { user, ratings, userRatings } = this.state;
    const timestamp = Math.round((new Date()).getTime() / 1000)
    const id = getNextId()
    const uid = rating.uid

    rating.timestamp = timestamp

    db.doCreateRating(id, rating)
    .then(data => {
      console.log(`Added rating (id: ${id}) to Firebase database`)
      this.rewardUser(user, uid, "RewardRating")
      const ratings1 = this.getRatingsNewestVersion([{ ...rating, id: id }, ...ratings]);
      const userRatings1 = this.getRatingsNewestVersion([{ ...rating, id: id }, ...userRatings]);

      this.setState({
        ratings: ratings1,
        userRatings: userRatings1
      });
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

  rewardUser = (user, uid, type) => {
    const { pid } = this.state;

    if (user && uid === user.uid) {
      ost.rewardUser(user, pid, type)
    }
    else {
      db.onceGetUser(uid).then(snapshot => {
        let fbUser = snapshot.val()
        this.setState({ user: { ...fbUser, uid } })
        ost.rewardUser(fbUser, pid, type)
        }
      );
    }
  }

  render() {
    const { pid, papers, user } = this.state;

    return(
      <Router>
        <div>
          <Navigation pid={pid} papers={papers} switchPaper={this.setCurrentPaper} />

          <Route exact path={routes.LANDING} render={() => <LandingPage />} />
          <Route exact path={routes.SIGN_UP} render={() => <SignUpPage setUser={this.setUser}/>} />
          <Route exact path={routes.SIGN_IN} render={() => <SignInPage />} />
          <Route exact path={routes.PASSWORD_FORGET} render={() => <PasswordForgetPage />} />
          <Route exact path={routes.VIEWER} render={(props) => <PdfViewer pid={pid} user={user} addRating={this.addRating} getRatingsForHighlight={this.getRatingsForHighlight} rewardUser={this.rewardUser} switchPaper={this.setCurrentPaper}/>} />
          <Route exact path={routes.ACCOUNT} render={() => <AccountPage />} />
          <Route exact path={routes.ADMIN} render={() => <AdminPage papers={papers} />} />
        </div>
      </Router>
    )
  }
}
  

export default withAuthentication(App);
