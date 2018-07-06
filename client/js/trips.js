import {Trips} from '../../lib/models/db';

Template.myTrips.onCreated(function() {
    Meteor.subscribe('trips');
});

Template.myTrips.helpers({
    tripList: function() {
        return Trips.find({});
    },
    translateStartDate: function(startDate) {
		return new Date(startDate).toLocaleDateString('en-GB', {  day: 'numeric', month: 'long', year: 'numeric' });
    },
    test: function() {
        console.log(Template.dayArray);
        //need to get the current data?
	},
});
