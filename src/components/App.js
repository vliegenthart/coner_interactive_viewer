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

const papers = [
  "coner",
  "conf_icwsm_BandariAH12",
  "conf_trec_BellotCEGL02",
]

const defaultPaper = papers[2];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pid: defaultPaper
    }
  }

  render() {
    const { pid } = this.state;
    
    return(
      <Router>
        <div>
          <Navigation />
          <Route exact path={routes.LANDING} component={() => <LandingPage />} />
          <Route exact path={routes.SIGN_UP} component={() => <SignUpPage />} />
          <Route exact path={routes.SIGN_IN} component={() => <SignInPage />} />
          <Route exact path={routes.PASSWORD_FORGET} component={() => <PasswordForgetPage />} />
          <Route exact path={routes.VIEWER} render={(props) => (<PdfViewer {...props} pid={pid} />)} />
          <Route exact path={routes.ACCOUNT} component={() => <AccountPage />} />
          <Route exact path={routes.ADMIN} component={() => <AdminPage />} />
        </div>
      </Router>
    )
  }
}
  

export default withAuthentication(App);
