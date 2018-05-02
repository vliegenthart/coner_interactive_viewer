import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import AuthUserContext from './AuthUserContext';
import SignOutButton from './SignOut';
import * as routes from '../constants/routes';

import colors from '../style/Colors'
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from 'material-ui/Switch';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Menu, { MenuItem } from 'material-ui/Menu';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    display: 'none',
  },
  appbar: {
    backgroundColor: colors.primary,
    boxShadow: 'none',
  },
  logo: {
    height: '50px',
    marginLeft: '-10px',
    marginTop: '2px',
  },
  linkInButton: {
    color: colors.logoText,
    textDecoration: 'none',

  }
};

class Navigation extends Component {
  state = {
    anchorEl: null,
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div className={classes.root}>
            <AppBar position="static" className={classes.appbar}>
              <Toolbar>
                <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                  <MenuIcon />
                </IconButton>
                <div className={classes.flex} >
                  <Link className={classes.linkInButton} to={routes.VIEWER}>
                    <img src="image/coner_icon_v1.png" alt="Coner Logo" className={classes.logo} />
                  </Link>
                </div>
                {authUser
                  ? (
                    <div>
                      <Button color="inherit"><Link className={classes.linkInButton} to={routes.LANDING}>Home</Link></Button>
                      <Button color="inherit"><Link className={classes.linkInButton} to={routes.VIEWER}>Viewer</Link></Button>

                      <IconButton
                        aria-owns={open ? 'menu-appbar' : null}
                        aria-haspopup="true"
                        onClick={this.handleMenu}
                        color="inherit"
                      >
                        <AccountCircle />
                      </IconButton>
                      <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        open={open}
                        onClose={this.handleClose}
                      >
                        <MenuItem onClick={this.handleClose}><Link className={classes.linkInButton} to={routes.ACCOUNT}>Account</Link></MenuItem>
                        <MenuItem onClick={this.handleClose}><SignOutButton /></MenuItem>
                      </Menu>
                    </div>
                  )
                  : (
                    <div>
                      <Button color="inherit"><Link className={classes.linkInButton} to={routes.LANDING}>Landing</Link></Button>
                      <Button color="inherit"><Link className={classes.linkInButton} to={routes.SIGN_IN}>Sign In</Link></Button>
                    </div>
                  )}
              </Toolbar>
            </AppBar>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

Navigation.propTypes = {
  classes: PropTypes.object.isRequired,
};

// const NavigationAuth = () =>

  

// const NavigationNonAuth = () =>
  

export default withStyles(styles)(Navigation);


