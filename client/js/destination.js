import { Meteor } from 'meteor/meteor';
import { Country } from '../../lib/models/country';



Template.destination.helpers({

    countries:function() {
        return Country.find({}, {sort: {country_name: 1}});
    }
});

Template.destination.onCreated(function(){

    Meteor.subscribe('getCountry');

});