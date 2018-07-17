import {ReactiveVar} from 'meteor/reactive-var'
import {Trips} from '../../lib/models/db';

/*
	oncreated - subscription and populate data
*/

Template.planner.onCreated(function() {
	
	/* ======================================================
					Subscriptions
	====================================================== */
	var tripSubscription = Meteor.subscribe('trips');

	/* ======================================================
					Trip Initialization
	====================================================== */
	//change this to session variable later. (tested session variable, abit iffy)
	this.trip = new ReactiveVar();
	var trip = this.trip;

	//reactive variable (Should be session) for new trip, if true means its a newly created trip. else false;
	this.newlyCreated = new ReactiveVar();
	var newlyCreated = this.newlyCreated;

	//eg "/?_id=new&country=mexico" -> _id = new, country = mexico
	//for loading of trip etc.
	//if new => create new trip with all undefined. owner = undefined
	if(FlowRouter.getQueryParam('_id') == "new" || localStorage.getItem('trip') == null)
	{
		newlyCreated.set(true);
		let countryEntered = FlowRouter.getQueryParam('country');
		if(countryEntered == undefined)
			countryEntered = "Custom";
		//to set a new trip
		var today = new Date();
		let newTrip = {
			owner: Meteor.userId(),
			tripName: "New Trip",
			country: countryEntered,
			startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(),0,0,0,0),
			dayArray: [
				[],
			],
			public: false,
		};
		trip.set(newTrip);
	}
	else
	{
		newlyCreated.set(false);
		if(FlowRouter.getQueryParam('_id') == undefined)
		{
			//current existing trip being edited
			//get current trip from localstorage and save it as current trip.
			trip.set(JSON.parse(localStorage.getItem('trip')));
			if(Meteor.userId())
			{
				trip.get().owner = Meteor.userId();
				trip.set(trip.get());
			}
		}
		else
		{
			//_id exists, try to load it from db
			//autorun will wait until tripsubscription is ready, then query db
			this.autorun(function(autorunner) {
				//not yet subscribed, return
				if(!tripSubscription.ready())
					return;
				//else do this
				else
				{
					var queryTrip = Trips.findOne( { _id: FlowRouter.getQueryParam('_id') } );
					//if exist = not undefined
					if(queryTrip != undefined)
						trip.set(queryTrip);
					else
					{
						//trip is not in the database. just create new trip for the user.
						newlyCreated.set(true);
						var today = new Date();
						let newTrip = {
							owner: Meteor.userId(),
							tripName: "New Trip",
							country: "Custom",
							startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(),0,0,0,0),
							dayArray: [
								[],
							],
							public: false,
						};
						trip.set(newTrip);
						//because onrendered will not trigger.
						$('#settingsModal').modal('show');
					}
					autorunner.stop();
				}
			});
		}
	}
});

Template.planner.onRendered(function() {
	if(Template.instance().newlyCreated.get())
	{
		$('#settingsModal').modal('show');
	}
});

/*
	planner helper and events
*/

Template.planner.helpers({

	//check trip, use this to get loading
	haveTrip: function() {
		var trip = Template.instance().trip.get();
		if(trip == undefined)
			return false;
		else
			return true;
	},
	//check if trip is owned or other's
	isOwner: function() {
		//if dont have, return false
		if(Template.instance().trip.get() != undefined)
		{
			//if owner is user and trip id is not null = trip belongs to the user (can be registered or not)
			if(Meteor.userId() == Template.instance().trip.get().owner)
				return true;
			else
				return false;
		}
		else
			return false;
	},
	//getters for trip attributes
	tripDays() {
		if(Template.instance().trip.get() == undefined)
			return "";
		return Template.instance().trip.get().dayArray;
	},
	tripName: function() {
		if(Template.instance().trip.get() == undefined)
			return "";
		return Template.instance().trip.get().tripName;
	},
	tripCountry: function() {
		if(Template.instance().trip.get() == undefined)
			return "";
		return Template.instance().trip.get().country;
	},
	tripStartDate: function() {
		if(Template.instance().trip.get() == undefined)
			return "";
		return new Date(Template.instance().trip.get().startDate).toLocaleDateString('en-GB', {  day: 'numeric', month: 'long', year: 'numeric' });
	},
	tripId: function() {
		if(Template.instance().trip.get() == undefined)
			return;
		return Template.instance().trip.get()._id;
	},

	//for displaying savetrip button
	checkLoginAndConnected: function() {
		return value = (Template.instance().subscriptionsReady() && Meteor.userId() != null);
	},

	//for displaying copytrip button
	checkConnected: function() {
		return value = (Template.instance().subscriptionsReady());
	},

	//pass on reactive variables to children templates
	reactiveTrip: function() {
		return Template.instance().trip;
	},
	reactiveNewlyCreated: function() {
		return Template.instance().newlyCreated;
	},

	//save trip constantly upon changes in localstorage
	localStorageTrip: function() {
		localStorage.setItem('trip', JSON.stringify(Template.instance().trip.get()));
		console.log("Trip saved in localstorage");
	},

	//to display alert if newlycreated is true
	isNewlyCreated: function() {
		//if newly created, wait till data populated then show modal.
		return Template.instance().newlyCreated.get();
	},

  	
});

Template.planner.events({

	//save trip in database (only if user is registered)
	async 'click .btn-saveTrip' (event) {
		let trip = Template.instance().trip.get();
		let tripReact = Template.instance().trip;
		let result = await Meteor.callPromise('trips.modify', trip);
		if(result != 1)
		{
			//meaning its a add, return _id
			tripReact.get()._id = result;
			tripReact.set(tripReact.get());
		}
		$('#saveTrip').modal("show");
		console.log("Saving . . .");
	},

	//save trip in database (only if user is registered)
	'click .btn-copyTrip' (event) {
		//set to local storage and go to flowrouter.go(planner)
		var copyTrip = JSON.parse(JSON.stringify(Template.instance().trip.get()));
		copyTrip.owner = Meteor.userId();
		delete copyTrip._id;
		copyTrip.public = false;
		Template.instance().trip.set(copyTrip);
		//set url to normal /planner/
		FlowRouter.withReplaceState(function() {
			FlowRouter.setQueryParams({_id: null});
			FlowRouter.setQueryParams({country: null});
		});
	},

	//add new day to dayarray
	'click .btn-addDay' (event) {
		//add a new day to the dayArray.
		var trip = Template.instance().trip;
		trip.get().dayArray.push([]);
		trip.set(trip.get());
	},
});

/*
	locationModalTemplate helper and events
*/

//datastructure for our trips?
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