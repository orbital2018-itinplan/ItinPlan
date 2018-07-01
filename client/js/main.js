import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
//import { Accounts } from 'meteor/accounts-base';
import 'bootstrap';

import '../html/main.html';

Meteor.startup(function() {
    const APIKey = "AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo";
    //load GoogleMaps
    GoogleMaps.load({key: APIKey});
});

//account config
