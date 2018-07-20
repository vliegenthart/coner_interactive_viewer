import React, { Component } from 'react';

import { 
  Link,
  withRouter, 
} from 'react-router-dom';

import { auth, db } from '../firebase';
import * as routes from '../constants/routes';
import * as ost from '../ost/ostClient';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const SignUpPage = ({ history, setUser }) =>
  <Grid container spacing={24} alignItems="center" direction="row" justify="center">
    <Grid item xs={8}>
      <Paper className="SignUp__paper Basic__paper">
        <h1>Sign Up</h1>
        <SignUpForm history={history} setUser={setUser} />
      </Paper>
    </Grid>
  </Grid>
  

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value,
});

class SignUpForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const {
      username,
      email,
      passwordOne,
    } = this.state;

    const {
      history,
      setUser,
    } = this.props;

    // Create user in Firebase Authentication
    auth.doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {

        // Create OST user
        ost.createUser(username).then(ost_res => {
          console.log(`Created OST user: ${username}`)
          const ostUser = JSON.parse(ost_res.body).data.user
          
          // Create user in custom Firebase accessible DB
          db.doCreateUser(authUser.uid, username, email, ostUser.id)
          .then(db_res => {
            const currUser = { role: 'USER', uid: authUser.uid, username: username, email: email, ostAttr: ostUser }
            this.setState(() => ({ username, email }));
            setUser(currUser, authUser);
            history.push(routes.VIEWER);
          })
          .catch(error => {
            this.setState(byPropKey('error', error));
          });

          ost.createReward(ost_res)
        })
        .catch((e) => {
          console.error("OSTError: ", e)
        });
      })
      .catch(error => {
        this.setState(byPropKey('error', error));
      });

    event.preventDefault();
  }

  render() {

    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <form onSubmit={this.onSubmit}>
        <FormControl className="FormControl">
          <InputLabel htmlFor="full-name">Full Name</InputLabel>
          <Input id="full-name" value={username} onChange={event => this.setState(byPropKey('username', event.target.value))} />
        </FormControl>

        <FormControl className="FormControl">
          <InputLabel htmlFor="email-address">Email Address</InputLabel>
          <Input id="email-address" value={email} onChange={event => this.setState(byPropKey('email', event.target.value))} />
        </FormControl>

        <br />

        <FormControl className="FormControl">
          <InputLabel htmlFor="password-one">Password</InputLabel>
          <Input id="password-one" type="password" value={passwordOne} onChange={event => this.setState(byPropKey('passwordOne', event.target.value))} />
        </FormControl>

        <FormControl className="FormControl">
          <InputLabel htmlFor="password-two">Confirm Password</InputLabel>
          <Input id="password-two" type="password" value={passwordTwo} onChange={event => this.setState(byPropKey('passwordTwo', event.target.value))} />
        </FormControl>

        <Button className="Submit__button" disabled={isInvalid} type="submit" variant="raised">
          Sign Up
        </Button>

        { error && <p>{error.message}</p> }
      </form>
    );
  }
}

const SignUpLink = () =>
  <p>
    Don't have an account?
    {' '}
    <Link to={routes.SIGN_UP}>Sign Up</Link>
    </p>

export default withRouter(SignUpPage);

export {
  SignUpForm,
  SignUpLink,
};
