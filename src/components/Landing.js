import React from 'react';
import * as routes from '../constants/routes';
import { Link } from 'react-router-dom';

import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';

const LandingPage = () =>

  <Grid container spacing={24} alignItems="center" direction="row" justify="center">
    <Grid item xs={8}>
      <Paper className="Basic__paper">
        <h1>Coner Interactive Document Viewer</h1>
        <Link to={routes.VIEWER}>Go to Coner Viewer</Link>
      </Paper>
    </Grid>
  </Grid>

export default LandingPage;