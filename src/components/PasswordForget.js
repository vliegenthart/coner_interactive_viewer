import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { auth } from '../firebase';

import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';

const PasswordForgetPage = () =>

  <Grid container spacing={24} alignItems="center" direction="row" justify="center">
    <Grid item xs={8}>
      <Paper className="Basic__paper">
        <h1>Reset Password</h1>
        <PasswordForgetForm />
      </Paper>
    </Grid>
  </Grid>

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value,
});

const INITIAL_STATE = {
  email: '',
  error: null,
};

class PasswordForgetForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { email } = this.state;

    auth.doPasswordReset(email)
      .then(() => {
        this.setState(() => ({ ...INITIAL_STATE }));
      })
      .catch(error => {
        this.setState(byPropKey('error', error));
      });

    event.preventDefault();
  }

  render() {
    const {
      email,
      error,
    } = this.state;

    const isInvalid = email === '';

    return (
      <form onSubmit={this.onSubmit}>
        <FormControl className="FormControl">
          <InputLabel htmlFor="email-address">Email Address</InputLabel>
          <Input id="email-address" value={email} onChange={event => this.setState(byPropKey('email', event.target.value))} />
        </FormControl>

        <Button className="Submit__button" disabled={isInvalid} type="submit" variant="raised">
          Reset My Password
        </Button>

        { error && <p>{error.message}</p> }
      </form>
    );
  }
}

const PasswordForgetLink = () =>
  <p>
    <Link to="/pw-forget">Forgot Password?</Link>
  </p>

export default PasswordForgetPage;

export {
  PasswordForgetForm,
  PasswordForgetLink,
};