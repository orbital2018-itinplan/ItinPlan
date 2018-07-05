import {Trips} from '../../lib/models/db';

Template.myTrips.onCreated(function() {
    Meteor.subscribe('trips');
});

Template.myTrips.helpers({
    tripList: function() {
        return Trips.find({});
    }
});
