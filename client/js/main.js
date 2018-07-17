import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
//import { Accounts } from 'meteor/accounts-base';
import 'bootstrap';

import '../html/main.html';

Meteor.startup(function() {
    const APIKey = "AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo";
    //load GoogleMaps
    GoogleMaps.load({
        key: APIKey,
        libraries: 'geometry, places'
    });
});

//account config

// nav bar effects
$(document).ready(function() {
    // Transition effect for navbar
    $(window).scroll(function() {
        // checks if window is scrolled more than 500px, adds/removes solid class
        if($(this).scrollTop() > 10) {
            $('.navbar').css('opacity', 1);
        } else {
            $('.navbar').css('opacity', 0.9);
        }
    });
});
