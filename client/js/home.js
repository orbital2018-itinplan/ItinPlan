import { Meteor } from 'meteor/meteor';
import { Country } from '../../lib/models/db';



Template.home.helpers({
    haveLocalTrip: function() {
        if(localStorage.getItem('trip') == null)
            return false
        return true;
    },
    countries: function() {
        return Country.find({}, {limit: 4});
    }
});

Template.home.onCreated(function(){

    Meteor.subscribe('getCountry');

});

Template.home.events({
    'click .hot-card' (event) {
        FlowRouter.go('/location/?country=' + this.country_name);
    }
});