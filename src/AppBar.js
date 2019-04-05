import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import ArrowBack from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';



const styles = theme => ({
    root: {
        position: 'fixed',
        left: '3%',
        top: '5%',
        zIndex: 1100,
        width: '94%',
        height:theme.spacing.unit * 6,
    },
    toolbarRoot: {
        paddingTop: theme.spacing.unit * 0.3,
        minHeight: theme.spacing.unit * 6,
        [theme.breakpoints.up('sm')]: {
            minHeight: theme.spacing.unit * 6,
        },
    },
  grow: {
    flexGrow: 1,
  },
    menuButton: {
        verticalAlign: 'middle',
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing.unit * 1,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 1,
      width: 'auto',
    },
  },
  searchIcon: {
      width: theme.spacing.unit * 5,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
      justifyContent: 'center',
  },
  inputRoot: {
    color: 'secondary',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  sectionMobile: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

class MainBar extends React.Component {
    constructor(props) {
        super(props);
        if (window.cordova) {
            window.addEventListener('keyboardDidHide', function () {
                document.getElementById('searchInput').blur();
            });
        }

        this.state = {
            anchorEl: null,
            mobileMoreAnchorEl: null,
            displayBack:this.props.displayBack,
        };
  
    }

    setupAutoComplete() {
        var input = document.getElementById('searchInput');
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new window.google.maps.Circle(
                { center: geolocation, radius: position.coords.accuracy });
            var options = {
                bounds: circle.getBounds(),
                types: ['establishment']
            };
            var autocomplete = new window.google.maps.places.Autocomplete(input, options);
        });
    };

    componentDidMount() {
        if (window.google) {
            this.setupAutoComplete();
        }

    }


    removeFocus() {
        document.getElementById('searchInput').blur();
    }
  handleProfileMenuOpen = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
    this.handleMobileMenuClose();
  };

  handleMobileMenuOpen = event => {
    this.setState({ mobileMoreAnchorEl: event.currentTarget });
  };

  handleMobileMenuClose = () => {
    this.setState({ mobileMoreAnchorEl: null });
  };

    handleSearch = () => {
        var input = document.getElementById('searchInput');
        var text = input.value;
        console.log(text);
        this.props.handleInputSearch(text);
    }

    handleClickAway = () => {
        document.getElementById('searchInput').blur();
    }

  render() {
    const { anchorEl, mobileMoreAnchorEl } = this.state;
    const { classes } = this.props;
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const renderMenu = (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={this.handleMenuClose}>My account</MenuItem>
      </Menu>
    );

    const renderMobileMenu = (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMobileMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleMobileMenuClose}>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <MailIcon />
            </Badge>
          </IconButton>
          <p>Messages</p>
        </MenuItem>
        <MenuItem onClick={this.handleMobileMenuClose}>
          <IconButton color="inherit">
            <Badge badgeContent={11} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <p>Notifications</p>
        </MenuItem>
        <MenuItem onClick={this.handleProfileMenuOpen}>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
          <p>Profile</p>
        </MenuItem>
      </Menu>
    );

      return (
          <div>
              <AppBar position="static" className={classes.root}>
                  <Toolbar className={classes.toolbarRoot}>
                      {this.state.displayBack ? 
                          <IconButton className={classes.menuButton} onClick={this.props.handleBack} color="inherit" aria-label="Back">
                              <ArrowBack />
                          </IconButton>
                          :
                          <IconButton className={classes.menuButton} onClick={this.props.toggleDrawer('left', true)} color="inherit" aria-label="Open drawer">
                            <MenuIcon />
                          </IconButton>
                      }
                    
                    <Typography className={classes.title} variant="h6" color="inherit" noWrap>
                      GoSafe
                    </Typography>
                      <div className={classes.search}>
                          <ClickAwayListener onClickAway={this.handleClickAway.bind(this)}>
                              <InputBase
                                  placeholder="Search…"
                                  id="searchInput"
                                  classes={{
                                      root: classes.inputRoot,
                                      input: classes.inputInput,
                                  }}
                              />
                          </ClickAwayListener>
                      </div>
                      <IconButton onClick={this.handleSearch.bind(this)} className={classes.searchIcon} color="inherit">
                          <SearchIcon />
                    </IconButton>
                    
                    <div className={classes.sectionDesktop}>
                      <IconButton color="inherit">
                        <Badge badgeContent={4} color="secondary">
                          <MailIcon />
                        </Badge>
                      </IconButton>
                      <IconButton color="inherit">
                        <Badge badgeContent={17} color="secondary">
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                      <IconButton
                        aria-owns={isMenuOpen ? 'material-appbar' : undefined}
                        aria-haspopup="true"
                        onClick={this.handleProfileMenuOpen}
                        color="inherit"
                      >
                        <AccountCircle />
                      </IconButton>
                    </div>
                    <div className={classes.sectionMobile}>
                      <IconButton aria-haspopup="true" onClick={this.handleMobileMenuOpen} color="inherit">
                        <MoreIcon />
                      </IconButton>
                    </div>
                  </Toolbar>
            </AppBar>
        {renderMenu}
        {renderMobileMenu}
      </div>
    );
  }
}

MainBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MainBar);