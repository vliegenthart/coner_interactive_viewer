import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router'

import AuthUserContext from './AuthUserContext';
import SignOutButton from './SignOut';
import OstWallet from './OstWallet';
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
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import sortBy from 'lodash/sortBy';
import { truncate } from '../utility/utilFunctions';
import ostSettings from '../ost/ostClientSettings';
import OstClient from '../ost/ostClient';
import CmcClient from '../cmc/cmcClient';
import isEqual from 'lodash/isEqual';

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
    this.handleCloseUser = this.handleCloseUser.bind(this); 
    this.handleCloseWallet = this.handleCloseWallet.bind(this);
    this.handlePaperchange = this.handlePaperChange.bind(this);
    this.calcTokenValue = this.calcTokenValue.bind(this);
    this.setTicker = this.setTicker.bind(this);
    
    this.state = {
      userAnchorEl: null,
      walletAnchorEl: null,
      ostPrice: 0,
      tokenValue: 0
    }

    this.ost = new OstClient()
    this.cmc = new CmcClient()

  }
  
  componentDidMount() {
    this.setTicker();
  }

  setTicker = () => {
    this.cmc.getTicker('OST').then(res => {
      const tokenValue = this.calcTokenValue(res.price_usd)
      this.setState(() => ({ ostPrice: res.price_usd }))
    });
  }

  handleMenu = event => {
    const anchorName = event.currentTarget.dataset.name
    this.setState({ [anchorName]: event.currentTarget });
  }

  handleCloseUser = () => {
    this.setState({ userAnchorEl: null });
  }

  handleCloseWallet = () => {
    this.setState({ walletAnchorEl: null });
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
    const { classes, papers, pid, user, tokenBalance, actionNames, actionIds } = this.props;
    const { userAnchorEl, walletAnchorEl, tokenValue } = this.state;
    const userOpen = Boolean(userAnchorEl);
    const walletOpen = Boolean(walletAnchorEl);

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
                            <MenuItem key={_paper['pid']} value={_paper['pid']}>{process.env.NODE_ENV === 'production' ? truncate(_paper['title'], 80) : _paper['pid']}</MenuItem>
                          )}
                        </Select>
                      }
                      
                      <Button color="inherit"><Link className={classes.linkInButton} to={routes.LANDING}>Home</Link></Button> 
                      
                      {window.location.pathname !== routes.VIEWER &&
                        <Button color="inherit"><Link className={classes.linkInButton} to={routes.VIEWER}>Viewer</Link></Button>
                      }

                      <IconButton
                        aria-owns={userOpen ? 'menu-appbar' : null}
                        aria-haspopup="true"
                        onClick={this.handleMenu}
                        color="inherit"
                        className="user-dropdown"
                        data-name="userAnchorEl"
                      >
                        <AccountCircle />
                      </IconButton>

                      <Menu
                        id="menu-appbar"
                        anchorEl={userAnchorEl}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        open={userOpen}
                        onClose={this.handleCloseUser}
                      > 

                        <MenuItem onClick={this.handleCloseUser}><Link className={classes.linkInButton} to={routes.ACCOUNT}>{user && user.username}</Link></MenuItem>
                        <MenuItem onClick={this.handleCloseUser}><SignOutButton /></MenuItem>
                      </Menu>

                      {ostSettings.ostDevMode &&
                        <React.Fragment>

                          <IconButton
                            aria-owns={walletOpen ? 'menu-appbar-2' : null}
                            aria-haspopup="true"
                            onClick={this.handleMenu}
                            color="inherit"
                            className="wallet-dropdown"
                            data-name="walletAnchorEl"

                          >
                            <AccountBalanceWalletIcon />
                          </IconButton>
                          <Menu
                            id="menu-appbar-2"
                            anchorEl={walletAnchorEl}
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            open={walletOpen}
                            onClose={this.handleCloseWallet}
                            className={"Wallet__menu"}
                          > 

                            <OstWallet user={user} actionIds={actionIds} pid={pid} />
                          </Menu>

                          <div className="token-balance-container">
                            <div className="token-balance">{parseFloat(tokenBalance).toFixed()} CNR</div>
                            <div className="price-usd">$ {this.calcTokenValue()}</div>
                          </div>
                        </React.Fragment>
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


