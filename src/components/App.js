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

const paperList = [
  "coner",
  "conf_icwsm_BandariAH12",
  "conf_trec_BellotCEGL02",
]

class App extends Component {
  constructor(props) {
    super(props);
    this.setCurrentPaper = this.setCurrentPaper.bind(this);

    this.state = {
      pid: paperList[2],
      papers: paperList,
      paperSwitched: false
    }
  }

  setCurrentPaper = (pid, paper) => {
    this.setState({ [pid]: paper, paperSwitched: true});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.paperSwitched) this.setState( { paperSwitched: false })
  }

  render() {
    const { pid, papers, paperSwitched } = this.state;

    return(
      <Router>
        <div>
          <Navigation pid={pid} papers={papers} switchPaper={this.setCurrentPaper} />

          <Route exact path={routes.LANDING} render={() => <LandingPage />} />
          <Route exact path={routes.SIGN_UP} render={() => <SignUpPage />} />
          <Route exact path={routes.SIGN_IN} render={() => <SignInPage />} />
          <Route exact path={routes.PASSWORD_FORGET} render={() => <PasswordForgetPage />} />
          <Route exact path={routes.VIEWER} render={(props) => <PdfViewer pid={pid} paperSwitched={paperSwitched} />} />
          <Route exact path={routes.ACCOUNT} render={() => <AccountPage />} />
          <Route exact path={routes.ADMIN} render={() => <AdminPage />} />
        </div>
      </Router>
    )
  }
}
  

export default withAuthentication(App);
