import { Mongo } from 'meteor/mongo';
 
export const Trips = new Mongo.Collection('trips');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('trips', function() {
    return Trips.find();
  });
}
