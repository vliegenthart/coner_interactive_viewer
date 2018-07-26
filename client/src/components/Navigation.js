import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router'

import AuthUserContext from './AuthUserContext';
import SignOutButton from './SignOut';
import * as routes from '../constants/routes';

import colors from './Colors';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import sortBy from 'lodash/sortBy';
import { truncate } from '../utility/utilFunctions';
import ostSettings from '../ost/ostClientSettings';
import CmcClient from '../cmc/cmcClient';

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
  },
  select: {
    marginRight: '15px'
  }
};

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.handleMenu = this.handleMenu.bind(this);
    this.handleClose = this.handleClose.bind(this); 
    this.handlePaperchange = this.handlePaperChange.bind(this);
    this.calcTokenValue = this.calcTokenValue.bind(this);
    this.setTicker = this.setTicker.bind(this);
    
    this.state = {
      anchorEl: null,
      ostPrice: 0,
      tokenValue: 0,
    }

    this.cmc = new CmcClient()
  }
  
  componentDidMount() {
    this.setTicker()
  }

  setTicker = () => {
    this.cmc.getTicker('OST').then(res => {
      const tokenValue = this.calcTokenValue(res.price_usd)
      this.setState(() => ({ ostPrice: res.price_usd }))
    });
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: null });
  }

  handlePaperChange = (event, uid) => {
    this.props.switchPaper(event.target.name, event.target.value, uid)
  }

  calcTokenValue = () => {
    const { user, tokenBalance } = this.props;
    const {ostPrice } = this.state;

    return ostPrice ? parseFloat(ostPrice * tokenBalance * ostSettings.ostMintRatio).toFixed(2) : 0.00
  }
    
  render() {
    const { classes, papers, pid, user, tokenBalance } = this.props;
    const { anchorEl, tokenValue } = this.state;
    const open = Boolean(anchorEl);

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div className={classes.root} >
            <AppBar position="fixed" className={classes.appbar}>
              <Toolbar className="coner-toolbar">
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
                      {window.location.pathname === routes.VIEWER &&
                        <Select
                          className={`${classes.select} paper-select`}
                          value={pid}
                          onChange={event => this.handlePaperChange(event, authUser.uid)}
                          inputProps={{
                            name: 'pid',
                            id: 'select-paper',
                          }}
                        >
                          {sortBy(papers, 'title').map(_paper => 
                            <MenuItem key={_paper['pid']} value={_paper['pid']}>{process.env.NODE_ENV === 'production' ? truncate(_paper['title'], 60) : _paper['pid']}</MenuItem>
                          )}
                        </Select>
                      }

                      <Button color="inherit"><Link className={classes.linkInButton} to={routes.LANDING}>Home</Link></Button> 
                      
                      {window.location.pathname !== routes.VIEWER &&
                        <Button color="inherit"><Link className={classes.linkInButton} to={routes.VIEWER}>Viewer</Link></Button>
                      }

                      <IconButton
                        aria-owns={open ? 'menu-appbar' : null}
                        aria-haspopup="true"
                        onClick={this.handleMenu}
                        color="inherit"
                        className="user-dropdown"
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
                        <MenuItem onClick={this.handleClose}><Link className={classes.linkInButton} to={routes.ACCOUNT}>{user && user.username}</Link></MenuItem>
                        <MenuItem onClick={this.handleClose}><SignOutButton /></MenuItem>
                      </Menu>

                      {ostSettings.ostDevMode && 
                        <div className="token-balance-container">
                          <div className="token-balance">{tokenBalance} CNR</div>
                          <div className="price-usd">$ {this.calcTokenValue()}</div>
                        </div>
                      }
                      
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
  

export default withRouter(withStyles(styles)(Navigation));


