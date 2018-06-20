import { ReactiveVar } from 'meteor/reactive-var'
import { Trips } from '../../lib/models/db';
import { Location } from '../../lib/models/db';
import { Country } from '../../lib/models/db';


Template.planner.onCreated(function() {
	var subscription = Meteor.subscribe('trips');
	Meteor.subscribe('getCountry');

	//change this to session variable later. (tested session variable, abit iffy)
	this.trip = new ReactiveVar();
	var trip = this.trip;
	
	//eg /?_id=new&country=mexico, _id = new, country = mexico
	if(FlowRouter.getQueryParam('_id') == "new")
	{
		//new trip
		console.log(Meteor.userId());
		let countryEntered = FlowRouter.getQueryParam('country');
		if(countryEntered == undefined)
			countryEntered = "Singapore";
		let newTrip = {
			owner: Meteor.userId(),
			country: countryEntered,
			startDate: "",
			dayArray: [
				[],
			],
		};
		//Session.set('trip', thistrip);
		trip.set(newTrip);
	}
	else if(FlowRouter.getQueryParam('_id') == undefined)
	{
		//current existing trip being edited
		//Session.set('trip', JSON.parse(localStorage.getItem('trip')));
		trip.set(JSON.parse(localStorage.getItem('trip')));
	}
	else
	{
		//load a trip from db
		this.autorun(function(autorunner) {
			//not yet subscribed, return
			if(! subscription.ready())
			  return;
			//else do this
			else
			{
				var queryTrip = Trips.findOne( { _id: FlowRouter.getQueryParam('_id') } );//.fetch()[0];
				//console.log(trip);
				//if exist = not undefined
				if(queryTrip != undefined)
					//Session.set('trip', queryTrip);
					trip.set(queryTrip);
				else
					console.log("invalid");
				autorunner.stop();
			}
		});
	}

});

Template.planner.onDestroyed(function (){

	//save as local storage
	localStorage.setItem('trip', JSON.stringify(this.trip.get()));

});

Template.planner.helpers({

	//check trip
	haveTrip: function() {
		var trip = Template.instance().trip.get();
		if(trip == undefined)
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
	
	//get trip will have gotten the trip, so return the trip array
	tripDays() {
		console.log(Template.instance().trip.get());
		return Template.instance().trip.get().dayArray;
		//Session.get('trip').dayArray;
	},

	tripCountry: function() {
		return Template.instance().trip.get().country;
		//Session.get('trip').country;
	},

	tripStartDate: function() {
		return Template.instance().trip.get().startDate;
		//Session.get('trip').startDate;
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
	
	checkLoginAndData: function() {
		var value = (Template.instance().subscriptionsReady() && Meteor.userId() != null) 
		return value;
	},

	reactiveTrip: function() {
		//pass on reactive trip to children templates
		return Template.instance().trip;
	}
});

Template.planner.events({

	'click .btn-saveLoc' (event) {
		var modal = $('#locationModal')
		row = modal.data("row");
		col = modal.data("col");
		//console.log(modal.find('.modal-body input').val());
		Template.instance().trip.get().dayArray[row][col] = modal.find('.modal-body input').val();
		Template.instance().trip.set(Template.instance().trip.get());
		//close(save) a javascript modal thing
		//gotten from bootstrap https://getbootstrap.com/docs/4.0/components/modal/?#varying-modal-content
	},

	'click .btn-saveTrip' (event) {

		//if there is existing, update
		//else add new entry
		var trip = Template.instance().trip.get();
		var queryTrip = Trips.findOne( { _id: Template.instance().trip.get()._id } );
		if(queryTrip == undefined)
		{
			//create new
			Meteor.call('trips.add', trip);
		}
		else
		{
			//update existing
		}
	}
});

Template.dayTemplate.helpers({
	
	getDayNum: function(ind) {
		return ind+1;
	},

});

Template.dayTemplate.events({
	'click .btn-dayAddLoc' (event) {
		//add a blank location.
		this.trip.get().dayArray[this.dayIndex].push("Name");
		this.trip.set(this.trip.get());
	}
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
		//remove from object.
		this.trip.get().dayArray[this.dayIndex].splice(this.locIndex, 1);
		this.trip.set(this.trip.get());
	},

	'click .btn-selectLoc' (event) {
		dayIndex = this.dayIndex;
		locIndex = this.locIndex;
		//open a javascript modal thing
		//gotten from bootstrap https://getbootstrap.com/docs/4.0/components/modal/?#varying-modal-content
		$('#locationModal').one('show.bs.modal', function (event) {
			var button = $(event.relatedTarget); // Button that triggered the modal
			var location = button.data('location'); // Extract info from data-* attributes
			// If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
			// Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
			var modal = $(this);
			modal.find('.modal-body input').val(location);
			//set row and column for later setting data
			modal.data("row", dayIndex);
			modal.data("col", locIndex);
		})
	}
});

