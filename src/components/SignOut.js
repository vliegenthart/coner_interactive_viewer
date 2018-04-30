import React from 'react';

import { auth } from '../firebase';

const SignOutButton = () =>
  <div
    onClick={auth.doSignOut}
  >
    Sign Out
  </div>

export default SignOutButton;
