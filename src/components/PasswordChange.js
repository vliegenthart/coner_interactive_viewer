import React, { Component } from 'react';

import { auth } from '../firebase';

import Input, { InputLabel } from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value,
});

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

class PasswordChangeForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { passwordOne } = this.state;

    auth.doPasswordUpdate(passwordOne)
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
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '';

    return (
      <form onSubmit={this.onSubmit}>
        <FormControl className="FormControl">
          <InputLabel htmlFor="password-one">New Password</InputLabel>
          <Input id="password-one" type="password" value={passwordOne} onChange={event => this.setState(byPropKey('passwordOne', event.target.value))} />
        </FormControl>

        <FormControl className="FormControl">
          <InputLabel htmlFor="password-two">Confirm New Password</InputLabel>
          <Input id="password-two" type="password" value={passwordTwo} onChange={event => this.setState(byPropKey('passwordTwo', event.target.value))} />
        </FormControl>

        <Button className="Submit__button" disabled={isInvalid} type="submit" variant="raised">
          Change My Password
        </Button>

        { error && <p>{error.message}</p> }
      </form>
    );
  }
}

export default PasswordChangeForm;
