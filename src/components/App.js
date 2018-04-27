// @flow

// Local development react-pdf-annotator: npm link ../../coner_v2/custom_npm_packages/react-pdf-annotator


// TODO
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
import HomePage from './Home';
import AccountPage from './Account';

import * as routes from '../constants/routes';
import { firebase } from '../firebase';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,
    };
  }

  componentDidMount() {
    firebase.auth.onAuthStateChanged(authUser => {
      authUser
        ? this.setState(() => ({ authUser }))
        : this.setState(() => ({ authUser: null }));
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Navigation authUser={this.state.authUser} />
          <hr/>

          <Route
            exact path={routes.LANDING}
            component={() => <LandingPage />}
          />
          <Route
            exact path={routes.SIGN_UP}
            component={() => <SignUpPage />}
          />
          <Route
            exact path={routes.SIGN_IN}
            component={() => <SignInPage />}
          />
          <Route
            exact path={routes.PASSWORD_FORGET}
            component={() => <PasswordForgetPage />}
          />
          <Route
            exact path={routes.HOME}
            component={() => <HomePage />}
          />
          <Route
            exact path={routes.ACCOUNT}
            component={() => <AccountPage />}
          />
        </div>
      </Router>
    );
  }
}

export default App;
