import { Trips } from '../../lib/api/database.js';

Template.planner.onCreated(function() {
	Meteor.subscribe('trips');
});

Template.planner.helpers({


	//get trip from this method and set to local variable
	getTrip() {
		console.log(this);
  		//this = Trips.find( { _id: "sfasdfa" } );
  		console.log(this);
  		return Trips.find( { _id: "sfasdfa" } );
  	},

	/*
	trip: {
		_id: "sfasdfa",
		startDate: "asdasd",
		endDate: "dasdasd",
		days: [
				{ loc: [{p: 'dfasdfas'}, {p: 'sdfasf'}, {p: 'fdfdfdfdf'}] },
			    { loc: [{p: '11123'}] },
			    { loc: [{p: '4444444'}] },
				{ loc: [{p: '5653653635'}] },
			]
	},*/
	locations: function() {
		console.log(this.days);
    	return this.days;

  	},

  	

  	trip() {
  		//Trips.findOne( {});
  		var found = Trips.find( { _id: "sfasdfa" } );
    	console.log(found);
    	console.log();
  	}

});

Template.place.helpers({
	location: function() {
		return this.p;
	}
});