import React from 'react';
import * as routes from '../constants/routes';
import { Link } from 'react-router-dom';

const LandingPage = () =>
  <div>
    <h1>Coner Interactive Document Viewer</h1>
    <Link to={routes.HOME}>Go to Coner Viewer</Link>
  </div>

export default LandingPage;