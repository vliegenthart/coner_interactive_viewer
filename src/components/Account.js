import React from 'react';

import AuthUserContext from './AuthUserContext';
import { PasswordForgetForm } from './PasswordForget';
import PasswordChangeForm from './PasswordChange';
import withAuthorization from './withAuthorization';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const AccountPage = () =>
  <AuthUserContext.Consumer>
    {authUser =>
      <Grid container spacing={24} alignItems="center" direction="row" justify="center">
        <Grid item xs={8}>
          <Paper className="Basic__paper">
            <h1>Account: {authUser.email}</h1>

            <h3 className="Form__header">Reset Password</h3>
            <PasswordForgetForm />
            <h3 className="Form__header">Change Password</h3>
            <PasswordChangeForm />
          </Paper>
        </Grid>
      </Grid>
    }
  </AuthUserContext.Consumer>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(AccountPage);
