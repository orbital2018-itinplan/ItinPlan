import { ReactiveVar } from 'meteor/reactive-var'
import { Trips } from '../../lib/models/db';
import { Location } from '../../lib/models/db';


Template.planner.onCreated(function() {
	Meteor.subscribe('trips');

	this.trip = new ReactiveVar();
});

Template.planner.helpers({

	//get trip from this method and set to local variable (only done when needed to get a saved trip)
	getTrip: function() {
		Template.instance().trip.set(Trips.find( { _id: "sfasdfa" } ).fetch()[0]);
		if(Template.instance().trip.get() != undefined)
		{
			console.log(Template.instance().trip.get());
		}
		else
			console.log("Cant find trip");
		//return trip;
		//return Trips.find( { _id: "sfasdfa" } ).fetch();
	},
	//check trip
	haveTrip: function() {
		if(Template.instance().trip.get() == undefined)
		{
			//console.log("no trip yet");
			return false;
		}
		else
		{
			//console.log("trip gotten");
			return true;
		}
	},

	//for creating new trips with country entered
	createTrip: function(countryEntered) {
		trip = {
			country: countryEntered,
			startDate: "",
			dayArray: [
				[ "mountain" , "beach" , "forest", "forest", "forest"],
				[ "forest" , "beach" ]
			],
		}
	},
	
	//get trip will have gotten the trip, so return the trip array
	tripDays() {
		return Template.instance().trip.get().dayArray;
	},

	tripCountry: function() {
		return Template.instance().trip.get().country;
	},

	tripStartDate: function() {
		return Template.instance().trip.get().startDate;
	},

	/*
	//need to add this into db to work the methods
	db.trips.insert({
		_id: "sfasdfa",
		country: "Mehiko",
		startDate: "asdasd",
		dayArray: [
				[ "mbs", "europe", "korea", "asdsad"] ,
				[ "jpy", "dd" ] ,
				[ "asadsad" ] ,
				[ "asadsad", "asdasd" ] ,
			]
	})
	,

	location: {
		_id: "test",
		country: _id for country,
		description: "placeId Desc"
		placeId: asdasd
	}
	*/

	//set this index to ind+1
	

	reactiveTrip: function() {
		return Template.instance().trip;
	}
});

Template.dayTemplate.helpers({
	
	getDayNum: function(ind) {
		return ind+1;
	},

	

});

Template.locationTemplate.helpers({
	//set this index to ind+1
	getLocNum: function(index) {
		return index+1;
	},

	locationName: function() {
		//get location from db, return location name.
		console.log(this);
		return this;
	},
});

Template.locationTemplate.events({
	'click .btn-deleteLoc' (event) {
		console.log(this.dayIndex + " " + this.locIndex);
		//remove from object.

		console.log(this.trip.get().dayArray[this.dayIndex]);
		this.trip.get().dayArray[this.dayIndex].splice(this.locIndex, 1);
		this.trip.set(this.trip.get());
		console.log(this.trip.get().dayArray[this.dayIndex]);
		console.log(this.trip);
		console.log(this.dayIndex + " " + this.locIndex);

	}
});