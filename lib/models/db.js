import { Mongo } from 'meteor/mongo';

export const Country = new Mongo.Collection('country');

export const Trips = new Mongo.Collection('trips');

export const Location = new Mongo.Collection('location');

