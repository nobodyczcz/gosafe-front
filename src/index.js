import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import './homeStyle.css'
import App from './App';
import * as serviceWorker from './serviceWorker';

const startApp = () => {

    ReactDOM.render(<App />, document.getElementById('root'));
    serviceWorker.unregister();
};

//startApp();
var oldLog = console.log

console.log = (message)=>{

}

if (window.cordova) {
    document.addEventListener('deviceready', startApp, false);
} else {
    startApp();
}