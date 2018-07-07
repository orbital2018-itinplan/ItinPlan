import { Mongo } from 'meteor/mongo';

export const Country = new Mongo.Collection('country');

export const Trips = new Mongo.Collection('trips');

export const Location = new Mongo.Collection('location');

Meteor.methods({
    
    //add new trip, ensure user is logged in.
    'trips.add' (trip) {
        if (trip.owner != Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return newId = Trips.insert(trip);
    },

    //update trip, ensure owner = meteor.userid
    'trips.update' (trip) {
        if (trip.owner != Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Trips.update(
            { _id : trip._id } ,
            trip
        );
    },

    //delete trip, ensure owner = meteor.userid
    'trips.remove' (trip) {
        if (trip.owner != Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Trips.remove(trip._id);
    }
    
});