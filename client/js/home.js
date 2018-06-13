import { Meteor } from 'meteor/meteor';
import { Country } from '../../lib/models/country';



Template.home.helpers({

    countries:function() {
        return Country.find({}, {limit: 4});
    }
});

Template.home.onCreated(function(){

    Meteor.subscribe('getCountry');

});