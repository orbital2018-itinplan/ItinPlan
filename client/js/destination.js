import { Meteor } from 'meteor/meteor';
import { Country } from '../../lib/models/db';

Template.destination.onCreated(function(){

    Meteor.subscribe('getCountry');

});

Template.destination.helpers({

    countries:function() {
        return Country.find({}, {sort: {country_name: 1}});
    }
});

Template.destination.events({
    'click .destination-card' (event) {
        FlowRouter.go('/location/?country=' + this.country_name);
    }
});

