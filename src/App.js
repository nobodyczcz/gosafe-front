import React, { Component } from 'react';
import MainBar from './AppBar';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import {MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import TurnedInIon from '@material-ui/icons/TurnedIn';

import { withStyles } from '@material-ui/core/styles';
import postscribe from 'postscribe';
import { Router, Route, Link } from "react-router-dom";
import LayerIcon from '@material-ui/icons/Layers';
import MyLocationIcon from '@material-ui/icons/MyLocation';

import Fab from '@material-ui/core/Fab';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Background from './backgroundPage';
import { createBrowserHistory, createHashHistory } from 'history';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ResultCard from './searchResult';
import HomePageStepper from './homePageStepper.js';
import ContactsPage from './contactsPage.js'
import PanicButton from './panicButton.js';
import suburbNames from './suburb.json';
import inerSuburbNames from './innerSuburb.json';
import MapController from './mapController.js'

import RegisterPage from './registerPage.js'



var history;
if (window.cordova) {
    history = new createHashHistory();
}
else {
    history = new createBrowserHistory();
}



const styles = theme => ({
    list: {
        width: 250,
    },
    layerContainer: {
        marginTop: theme.spacing.unit * 19,
        
    },
    layerIcon: {
        position:'absolute',
        left: 'calc(100% - 60px)',
        display: 'flex',
        zIndex: 1100,
    },
    myPositionIcon: {
        position: 'absolute',
        left: 'calc(100% - 60px)',
        top:'calc(100% - 120px)',
        display: 'flex',
        zIndex: 1100,
    },
    menu: {
        display: 'flex',
        zindex:1100,
    },
    layerMenu: {
        position: 'fixed',
        top: theme.spacing.unit * 18,
        left: 'calc( 100% - 150px)',
        width: theme.spacing.unit * 17,
        zIndex:1300
    },
    fullList: {
        width: 'auto',
    },
    panicPosition: {
        position: 'fixed',
        top: 'calc( 100% - 150px)',
        left: 'calc( 50% - 50px)',
        zIndex:1200,
    },
    sideContentBar: {
        marginTop: theme.spacing.unit * 5,
    },
    sideContent: {
        color:'#FF7504',
        underline: "none",
    },
    legend: {
        position: "absolute",
        top: 'calc( 100% - 100px)',
        width: "30%",
        left:"2%",
        zIndex: 1300,
        borderRadius: "5px",
        opacity:0.8

    },
    startUpPageLayer: {
        position: 'absolute',
        top:0,
        left:0,
        width: '100%',
        height: '100%',
        zIndex: 1400,
        backgroundColor: "#ffffff"
    },
    welcomeImgContainer:{
        position:'absolute',
        top: '20%',
        left: '5%',
        width: '95%',
        zIndex: 1410,
    },
    welcomeImg:{
        width:'100%',
        top:0,
        left:0,
    },
});

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
  palette: {
    primary: {
        light: '#ffffff',
        main: '#ffffff',
        dark: '#bdbdbd',
        contrastText: '#ff7504',
    },
    secondary: {
        light: '#ff8a65',
        main: '#ff7504',
      dark: '#ffa733',
      contrastText: '#fff',
      },
    error: {
        main: '#ff8a65',
        contrastText: '#000',
    }
  },
});

class App extends Component {
    constructor(props) {
        super(props);
        this.map = null;
        if (window.cordova) {
            console.log('Using cordova: initiate app')
            if (window.cordova.platformId === 'android') {
                window.StatusBar.overlaysWebView(true);
                window.StatusBar.backgroundColorByHexString('#33000000');
            }
        }
        else {
            console.log('Not using cordova: initiate app')
        };


        /*
        Map related attributes:
        */

        this.mapController = new MapController();

        this.userMarker = null; //current user location marker
        this.directionsService = null;
        this.directionsDisplay = null;

        this.focusUser = true;

        this.markers = null;
        this.service = null; // google map places services
        this.suburbSet = new Set();

        this.userLocation = null;
        this.heading = null; // direction of user heading
        this.basicHeading = 122; //The small triangle on user marker do not point north on default, we use this to fix the initial direction of the triangle.
        this.userLocationImage = null;  //The svg image of user location marker
        this.navRoutes = {
            driving: null,
            walking: null,
            transit: null

        }; //Store navigation route at here

        this.navValue = 0; //dicide which tag (walking driving and publictransport) is activated when jump to navigate page, 
        this.api = null;

        this.apiKey = 'AIzaSyAFxfzpmKW1-P7LoPmoeTjwoHrNH-Noe_0';
        
        this.mapurl = "https://maps.googleapis.com/maps/api/js?key=" + this.apiKey;

        /*
        Map related attributes finish
        */

        console.log('create ref')
        this.mainBar = React.createRef();

        console.log('test data')
        this.crimeData = {
            'type': 'FeatureCollection',
            'features': [
                
            ],
        };


        console.log('set state')

        
        if (document.getElementById('mapdiv').childNodes.length === 0) {
            //load map script from server. and render map when script is loaded
            console.log('download map scripts')
            postscribe('#mapdiv', '<script language="javascript" src=' + this.mapurl + '&libraries=places></script>', {
                done: this.renderMap.bind(this),
            });
        }  

        
        
        this.state = {  // state of react component
            left: false,
            currentPage: 0,
            mobileMoreAnchorEl: null,
            focusUser: false,
            layerMenu: false,
            searchResponse: null,
            displayBack: false,
            displayNavRoutes: false,
            navigating: false,
            currentRoute: null,
            mapLayer:'all',
            startUpPageLayer: true,
            welcomeImgContainer:true,
        };
        
        this.interval= null;

        console.log('initiate done')

    }
    /*
     * Constructor finish
     */ 

    

    /*Map and crime rate visiualization related functions
     * 
     * 
     */

    componentDidMount() { //start loading crime rate data when this page is rendered
        //var suburbs = ["CAULFIELD", "CAULFIELD EAST"];
        var suburbs = inerSuburbNames;
        var data = [];

        this.interval = setTimeout(() => this.setState({startUpPageLayer: false}), 3000);


        for (var i in suburbs) {
            if (!this.suburbSet.has(suburbs[i])) {
                data.push(suburbs[i])
                this.suburbSet.add(suburbs[i])
            }

            if (data.length > 30) {
                this.requestCrime(JSON.stringify(data));
                data = []
            }

        }
        if (data.length > 0) {
            this.requestCrime(JSON.stringify(data));
        }

    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    requestCrime(jsonData) {
        //load crime data from server. Display the data one loaded 
        console.log('sendData: ', jsonData);
        fetch(window.serverUrl + 'api/Suburbs/Details/', {
            method: 'POST',
            body: jsonData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .then(response => {
                console.log(response);
                response = JSON.parse(response);
                var newRateData = {
                    'type': 'FeatureCollection',
                    'features': [

                    ],
                };
                for (var i in response) {
                    var crime = {
                            'type': 'Feature',
                            'properties': {
                                'crimeRate': 0,
                                'suburb': '',
                                },
                            'geometry': {}
                    }
                    crime.properties.suburb = response[i].suburbname;
                    crime.properties.crimeRate = response[i].crimeRate
                    crime.geometry = JSON.parse(response[i].boundary.replace(/'/g, '"'));
                    this.crimeData.features.push(crime);
                    newRateData.features.push(crime)
                }
                if (this.state.mapLayer === 'all') {
                    this.mapController.displayAllCrime(this.map, newRateData);
                }
                else if (this.state.mapLayer === 'high') {
                    this.mapController.displayHighCrimeOnly(this.map, newRateData);
                }

                

            })
            .catch(error => {
                console.log('error')
                console.error('Error:', error)
            });
    }

    
    handleAllCrime() {
        //Whe user click full heatmap in layer meun. Display all crime rate data on map.
        this.mapController.clearMap(this.map)
        this.mapController.displayAllCrime(this.map, this.crimeData);

        this.handleMobileMenuClose();
        this.handleMobileMenuClose();
        this.setState({ mapLayer: 'all' });
    }
    handleHighCrime() {
        //When user click high crime only on layer meun clear map and display all crime data on the map
        this.mapController.clearMap(this.map)
        this.mapController.displayHighCrimeOnly(this.map, this.crimeData);

        this.handleMobileMenuClose();
        this.handleMobileMenuClose();
        this.setState({ mapLayer: 'high' });

    }
    handleCrimeOff() {
        //When user click crime rate off on layer meun. clear map 
        this.mapController.clearMap(this.map);

        this.handleMobileMenuClose();
        this.setState({ mapLayer: 'off' });

    }

    /*Map and crime rate visiualization related functions
     * 
     * Finish
     */


    /*Map initialization and user location related functions
     * 
     * 
     */


    
    renderMap() {
        const google = window.google
        this.map = new google.maps.Map(document.getElementById('MAP'), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
            disableDefaultUI: true,
            scaleControl: true,
        });

        this.userLocationImage = {
            path: 'm4.875098,16.605717c-0.029873,-2.433882 0.634361,-4.022277 1.627162,-5.678671c0.992793,-1.656386 2.932073,-3.720554 4.74924,-4.408087c1.81716,-0.687541 3.921607,-1.167871 6.000649,-0.805492c2.079049,0.36238 5.338262,2.391187 6.88208,4.50682c1.54381,2.115634 3.648258,6.518236 3.552675,8.990873c-0.095591,2.472637 -0.470363,4.422155 -1.946421,6.460716c-1.476058,2.03856 -3.891329,3.333441 -5.87534,3.882768c-1.984019,0.549335 -4.916731,0.058456 -7.001448,-0.884383c-2.084724,-0.942847 -7.953368,-4.693612 -8.669499,-10.903462c-0.716131,-6.209842 -5.777823,8.471585 -4.537555,10.492192c1.240268,2.020599 16.396471,3.800382 11.481619,0.594933c-4.914845,-3.205448 -6.233289,-9.814326 -6.263162,-12.248208z',
            fillColor: '#ff7504',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor:'#ffffff',
            strokeOpacity:1,
            size: new window.google.maps.Size(30, 30),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(14, 14),
            rotation: this.basicHeading+this.heading,
        }
        console.log('render map done');
        this.currentLocation(); //Set user location marker and initial location when map loaded.
        console.log('set current location done')

        //initialize places service
        this.service = new window.google.maps.places.PlacesService(this.map);

        //initialize direction service
        this.directionsService = new window.google.maps.DirectionsService();
        this.directionsDisplay = new window.google.maps.DirectionsRenderer();

        this.mainBar.current.setupAutoComplete();
        console.log('set auto complete done')

        window.navigator.geolocation.watchPosition(this.onUpdateLocation.bind(this), this.onLocationErr.bind(this), { enableHighAccuracy: true })
        console.log('set location listener done')

        this.map.addListener('dragstart', function () {
            // 3 seconds after the center of the map has changed, pan back to the
            // marker.
            this.focusUser = false;
            console.log('focus user off')
            document.getElementById('searchInput').blur();

        }.bind(this));

        
    };

    currentLocation() {
        //set the current location and user marker after user open the app.
        console.log('focus current location')
        navigator.geolocation.getCurrentPosition(function (position) {
            var thelat = position.coords.latitude;
            var thelng = position.coords.longitude;
            if (position.coords.heading) {
                this.heading = position.coords.heading;
            }
            console.log(thelat)
            console.log(thelng)
            console.log(this.heading)
            this.userLocation = { lat: thelat, lng: thelng }
            this.map.setCenter({ lat: thelat, lng: thelng })
            this.map.setZoom(15)
            if (!this.userMarker) {
                console.log('Set up marker');
                this.userLocationImage.rotation = this.heading;
                // Shapes define the clickable region of the icon. The type defines an HTML
                // <area> element 'poly' which traces out a polygon as a series of X,Y points.
                // The final coordinate closes the poly by connecting to the first coordinate.
                this.userMarker = new window.google.maps.Marker({
                    position: { lat: thelat, lng: thelng },
                    map: this.map,
                    icon: this.userLocationImage,
                });
                this.userMarker.setMap(this.map)
            }
        }.bind(this));
    }

    getLocation() {
        //return user's current location when required
        return this.userLocation;
    }

    handleMyLocationClick() {
        console.log('my location clicked')
        if (!this.userLocation) {

        }
        else if (this.focusUser) {
            this.map.setZoom(18);
        }
        else {
            this.focusUser = true;
            this.map.setZoom(15);
            this.map.setCenter(this.userLocation);
            this.currentLocation();
            console.log('focus user on')

        }

    }

    onUpdateLocation(position) {
        //update user location and heading direction.
        console.log('update location triggered')
        var thelat = position.coords.latitude;
        var thelng = position.coords.longitude;
        if (position.coords.heading) {
            this.heading = position.coords.heading;

        }
        console.log('heading:' + this.heading)

        this.userLocation = { lat: thelat, lng: thelng }

        if (this.userMarker) {
            console.log('update user location')

            this.userLocationImage.rotation = this.basicHeading + this.heading;

            this.userMarker.setIcon(this.userLocationImage);

            this.userMarker.setPosition({ lat: thelat, lng: thelng });
        }
        if (this.focusUser) {
            this.map.setCenter({ lat: thelat, lng: thelng })
        }
    }
    onLocationErr(err) {
        console.log(err)
    }

    

    /*Map initialization and user location related functions
     * 
     * Finish
     */

    /*Map search related functions
     * 
     * 
     */
    handleInputSearch = (input) => {

        if (this.service) {
            var currentlocation = this.userLocation;
            var request = {
                location: currentlocation,
                radius: '1000',
                query: input
            };
            this.service.textSearch(request, this.displaySearchResult.bind(this));
        }
        else {
            this.service = new window.google.maps.places.PlacesService(this.map);
            var currentlocation = this.userLocation;
            var request = {
                location: currentlocation,
                radius: '1000',
                query: input
            };
            this.service.textSearch(request, this.displaySearchResult.bind(this));
        }
    };

    clearAllMarkers = () => {
        console.log('clear mark')
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
    };

    displaySearchResult = (result) => {
        this.mainBar.current.setState({ searching: false });
        console.log(result)
        this.setState({ searchResponse: result, displayBack: true })
        console.log(this.markers)
        if (this.markers) {
            this.clearAllMarkers();
        }
        else {
            this.markers = [];
        }


        for (var i = 0; i < result.length; i++) {
            var name = result[i].name;
            var icon = result[i].icon;
            var address = result[i].formatted_address;
            var location = result[i].geometry.location;

            if (i === 0) {
                this.map.setCenter(location);
            }

            //var image = icon;
            var image = {
                url: icon,
                // This marker is 20 pixels wide by 32 pixels high.
                scaledSize: new window.google.maps.Size(30, 30),
                // The origin for this image is (0, 0).
                origin: new window.google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new window.google.maps.Point(15, 15)
            };

            var shape = {
                coords: [1, 1, 1, 18, 20, 18, 20, 1],
                type: 'poly'
            };

            var marker = new window.google.maps.Marker({
                position: { lat: location.lat(), lng: location.lng() },
                map: this.map,
                icon: image,
                shape: shape,
                title: name,
                zIndex: 1100,
            });
            marker.setMap(this.map)
            this.markers.push(marker);
        }

    };

    /*Map search related functions
     * 
     * finish
     */

    /*Map navigation related functions
     * 
     * 
     */

    navigateTo(location) {

        this.setState({ displayNavRoutes: false });

        var drivingRequest = {
            origin: this.userLocation,
            destination: location,
            travelMode: 'DRIVING',
            transitOptions: {
                departureTime: new Date(Date.now())
            },
        };

        this.directionsService.route(drivingRequest, function (result, status) {
            console.log('get driving: ' + status)
            if (status == 'OK') {
                this.navRoutes.driving = result
                if (!this.state.displayNavRoutes) {
                    this.setState({ displayNavRoutes: true });
                    this.setNavMode('driving');
                }
            }
        }.bind(this));

        var walkRequest = {
            origin: this.userLocation,
            destination: location,
            travelMode: 'WALKING',
            transitOptions: {
                departureTime: new Date(Date.now())
            },
        };

        this.directionsService.route(walkRequest, function (result, status) {
            console.log('get walking: ' + status)
            if (status == 'OK') {

                this.navRoutes.walking = result
                if (!this.state.displayNavRoutes) {
                    this.setState({ displayNavRoutes: true });
                    this.setNavMode('walking');
                }
            }
        }.bind(this));

        var transitRequest = {
            origin: this.userLocation,
            destination: location,
            travelMode: 'TRANSIT',
            transitOptions: {
                departureTime: new Date(Date.now())
            },
        };
        this.directionsService.route(transitRequest, function (result, status) {
            console.log('get transit: ' + status)
            if (status == 'OK') {

                this.navRoutes.transit = result
                if (!this.state.displayNavRoutes) {
                    this.setState({ displayNavRoutes: true });
                    this.setNavMode('transit');
                }
            }
        }.bind(this));
    };

    setNavMode(mode) {
        console.log('set transit mode: ' + mode)
        this.directionsDisplay.setMap(this.map);
        if (mode === 'walking') {
            console.log(this.navRoutes.walking);
            this.navValue = 0
            this.setState({ currentRoute: this.navRoutes.walking }, function () { this.directionsDisplay.setDirections(this.state.currentRoute) });
        }
        else if (mode === 'transit') {
            console.log(this.navRoutes.transit)
            this.navValue = 1

            this.setState({ currentRoute: this.navRoutes.transit }, function () { this.directionsDisplay.setDirections(this.state.currentRoute) });
        }
        else if (mode === 'driving') {
            console.log(this.navRoutes.driving)
            this.navValue = 2

            this.setState({ currentRoute: this.navRoutes.driving }, function () { this.directionsDisplay.setDirections(this.state.currentRoute) });
        }



    };

    /*Map search related functions
     * 
     * finish
     */

    /* The buttons and icons on map page
     * 
     * 
     */ 
    mapPage() {
        //define the appearance of map 
        console.log('render home page')
        const { classes } = this.props;



        const { mobileMoreAnchorEl, layerMenu } = this.state;
        const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
        var theleft;
        var thetop;
        if (isMobileMenuOpen) {
            var x = mobileMoreAnchorEl.getBoundingClientRect();
            theleft = x.left - 125;
        };
        return (
            <div>


                <div className={classes.layerContainer}>

                    <Fab onClick={this.handleMobileMenuOpen} color="primary" size="small" className={classes.layerIcon}>
                        <LayerIcon />
                    </Fab>
                    {this.state.mapLayer === "off" ? null : <img src="img/legend.png" className={classes.legend}></img>}

                    {this.state.layerMenu ? (
                        <ClickAwayListener onClickAway={this.handleClickAway.bind(this)} onTouchEnd={this.handleClickAway.bind(this)}>
                            <Paper className={classes.layerMenu}>
                                <MenuItem onClick={this.handleCrimeOff.bind(this)} onTouchEnd={this.handleCrimeOff.bind(this)}>
                                    <p>Heatmap OFF</p>
                                </MenuItem>
                                <MenuItem onClick={this.handleAllCrime.bind(this)} onTouchEnd={this.handleAllCrime.bind(this)}>
                                    <p>Full Heatmap</p>
                                </MenuItem>

                                <MenuItem onClick={this.handleHighCrime.bind(this)} onTouchEnd={this.handleHighCrime.bind(this)}>
                                    <p>High Crime Only</p>
                                </MenuItem>
                            </Paper>
                        </ClickAwayListener>
                    ) : null}
                </div>
                <Fab onClick={this.handleMyLocationClick.bind(this)} color="primary" size="small" className={classes.myPositionIcon}>
                    <MyLocationIcon />
                </Fab>
                {!this.state.searchResponse ? (
                    <div className={classes.panicPosition}>
                        <PanicButton getLocation={this.getLocation.bind(this)} />

                    </div>
                ) : null
                }

                {this.state.searchResponse ? (
                    <ResultCard apiKey={this.apiKey} map={this.map} getLocation={this.getLocation.bind(this)} results={this.state.searchResponse} currentRoute={this.state.currentRoute} navigateTo={this.navigateTo.bind(this)} ></ResultCard>
                ) : null}
            </div>
        );
    }

    handleMobileMenuClose = () => {
        this.setState({ mobileMoreAnchorEl: null, layerMenu: false });
    };

    handleClickAway() {
        if (this.state.layerMenu) {
            this.handleMobileMenuClose();
        }
    }

    handleMobileMenuOpen = event => {
        console.log(this.state.layerMenu)
        if (this.state.layerMenu) {
            console.log("close")
            this.handleMobileMenuClose();
        }
        else {
            this.setState({ mobileMoreAnchorEl: event.currentTarget, layerMenu: true });
        }
    };
    /* The buttons and icons on map page
     * 
     * finish
     */


    toggleDrawer = (side, open) => () => {
    this.setState({
        [side]: open,
    });
        
    };

    handleBack() {
        console.log('handle back trigered');
        if (this.state.displayNavRoutes) {
            console.log('cancel navi')
            this.setState({ displayNavRoutes: false, currentRoute:null,currentPage:1 });
            this.navRoutes = {
                driving: null,
                walking: null,
                transit: null
            }
            this.directionsDisplay.setMap(null);
        }
        else {
            this.setState({ searchResponse: null, displayBack: false,currentPage:1 });
            this.clearAllMarkers();
        }
        
    }



    theBar = () => {
        // search and navigate bar
        return (
            <MainBar
                toggleDrawer={this.toggleDrawer}
                handleInputSearch={this.handleInputSearch.bind(this)}
                innerRef={this.mainBar}
                displayBack={this.state.displayBack}
                handleBack={this.handleBack.bind(this)}
                history={history}
                displayNavRoutes={this.state.displayNavRoutes}
                setNavMode={this.setNavMode.bind(this)}
                tabValue={this.state.currentPage}
                navValue={this.navValue}
            >
            </MainBar>
        );

    };

    homePage() {

        return (
            <div>
                <HomePageStepper />
            </div>
            
            );
    }

    aboutUs() {
        return(
            <div>
                <Typography className={classes.mainText} variant='h6'>
                    <br/>
                    Your safe journey Home is important.
                    <br/>
                    Find your safe way home.
                </Typography>
            </div> 
        );
    }

    startUpPage() {
        return(
            <div className={this.props.classes.startUpPageLayer} >
                <div className={this.props.classes.welcomeImgContainer} >
                    <img src="img/icon.png" className={this.props.classes.welcomeImg} alt='GoSafe'/> 
                </div>
            </div>
        );
    }

    

    render() {
        //Basic structure of the whole app
        console.log('reander basic app')
        const { classes } = this.props;

        const sideList = (
            <div>
                <List className={classes.sideContentBar}>
                    <ListItem button key='Navigation'>
                        <Link 
                            className={classes.sideContent}
                            variant='h6'
                            onClick={() => {this.aboutUs()}}
                        >
                            About Us
                        </Link>
                    </ListItem>
                </List>
            </div>
        );

        return (
            <MuiThemeProvider theme={theme}>
                <Router history={history}>
                    { this.state.startUpPageLayer ? this.startUpPage() : null }
                    <SwipeableDrawer
                        open={this.state.left}
                        onClose={this.toggleDrawer('left', false)}
                        onOpen={this.toggleDrawer('left', true)}
                    >
                        <div
                            tabIndex={0}
                            role="button"
                            onClick={this.toggleDrawer('left', false)}
                            onKeyDown={this.toggleDrawer('left', false)}
                        >
                            {sideList}
                        </div>
                    </SwipeableDrawer>
                    <div className='mapStyle' id='MAP'>
                    </div>
                    {this.theBar()}
                    <Route exact path="/" component={this.homePage.bind(this)} />
                    <Route exact path="/map" component={this.mapPage.bind(this)} />
                    <Route exact path="/contacts" component={ContactsPage} />
                    <Route exact path="/register" component={RegisterPage} />
                </Router>  
          </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(App);
