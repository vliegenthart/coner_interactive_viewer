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

import { auth, db } from '../firebase';
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

class App extends Component {
  constructor(props) {
    super(props);
    this.setCurrentPaper = this.setCurrentPaper.bind(this);
    this.rewardUser = this.rewardUser.bind(this);

    this.state = {
      pid: config.defaultPaper,
      papers: config.papers,
      user: null    
    }
  }

  setCurrentPaper = (pid, paper, uid) => {
    const { user } = this.state;

    this.setState({ [pid]: paper });
    this.rewardUser(user, uid, "RewardSwitchPaper")
  }

  rewardUser = (user, uid, type) => {
    if (user && uid === user.uid) {
      ost.rewardUser(user, type)
    }
    else {
      db.onceGetUser(uid).then(snapshot => {
        this.setState({ user: { ...snapshot.val(), uid } })
        ost.rewardUser(snapshot.val(), type)
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
          <Route exact path={routes.SIGN_UP} render={() => <SignUpPage />} />
          <Route exact path={routes.SIGN_IN} render={() => <SignInPage />} />
          <Route exact path={routes.PASSWORD_FORGET} render={() => <PasswordForgetPage />} />
          <Route exact path={routes.VIEWER} render={(props) => <PdfViewer pid={pid} user={user} rewardUser={this.rewardUser}/>} />
          <Route exact path={routes.ACCOUNT} render={() => <AccountPage />} />
          <Route exact path={routes.ADMIN} render={() => <AdminPage />} />
        </div>
      </Router>
    )
  }
}
  

export default withAuthentication(App);
