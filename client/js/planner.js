import {ReactiveVar} from 'meteor/reactive-var'
import {Trips} from '../../lib/models/db';
import {HTTP} from 'meteor/http';
import {Location} from '../../lib/models/db';
import {Country} from '../../lib/models/db';
import {Session} from 'meteor/session'

/*
	oncreated - subscription and populate data
*/

Template.planner.onCreated(function() {

	// We can use the `ready` callback to interact with the map API once the map is ready.
	GoogleMaps.ready('locMap', function (map) {
		// Add a marker to the map once it's ready
		// var marker = new google.maps.Marker({
		//     position: map.options.center,
		//     map: map.instance
		// });
	});

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
		};
		trip.set(newTrip);
	}
	else
	{
		newlyCreated.set(false);
		if(FlowRouter.getQueryParam('_id') == undefined)
		{
			//current existing trip being edited
			//Session.set('trip', JSON.parse(localStorage.getItem('trip')));
			trip.set(JSON.parse(localStorage.getItem('trip')));
			if(Meteor.userId())
			{
				trip.get().owner = Meteor.userId();
				trip.set(trip.get());
			}
		}
		else
		{
			//load a trip from db
			this.autorun(function(autorunner) {
				//not yet subscribed, return
				if(! tripSubscription.ready())
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
						newlyCreated.set(true);
						var today = new Date();
						let newTrip = {
							owner: Meteor.userId(),
							country: "Custom",
							startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(),0,0,0,0),
							dayArray: [
								[],
							],
						};
						trip.set(newTrip);
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
	checkLoginAndData: function() {
		return value = (Template.instance().subscriptionsReady() && Meteor.userId() != null)
	},

	//pass on reactive trip to children templates
	reactiveTrip: function() {
		return Template.instance().trip;
	},

	//pass on reactive trip to children templates
	reactiveNewlyCreated: function() {
		return Template.instance().newlyCreated;
	},

	//save trip in localstorage
	localStorageTrip: function() {
		localStorage.setItem('trip', JSON.stringify(Template.instance().trip.get()));
		console.log("Trip saved in localstorage");
	},

	isNewlyCreated: function() {
		//if newly created, wait till data populated then show modal.
		return Template.instance().newlyCreated.get();
	},

  	locationMap: function () {
      const countryName = Template.instance().trip.get().country;
      console.log(countryName);

      var country = Country.find({country_name: countryName}).fetch();
      //console.log("FROM DB:" + country[0].lat);

      if (GoogleMaps.loaded()) {
          // Map initialization options
          return {
              center: new google.maps.LatLng(country[0].lat, country[0].lng),
              zoom: 6
          };
      }
  	}
});

Template.planner.events({

	async 'click .btn-saveLoc'(event) {
		var modal = $('#locationModal')
		row = modal.data("row");
		col = modal.data("col");
		//console.log(modal.find('.modal-body input').val());
		console.log(Session.get('placeId'));


		//console.log(Template.instance().trip.get());
		Template.instance().trip.get().dayArray[row][col] = Session.get('placeId');
		Template.instance().trip.set(Template.instance().trip.get());
		//close(save) a javascript modal thing
		//gotten from bootstrap https://getbootstrap.com/docs/4.0/components/modal/?#varying-modal-content
	},

	async 'click .btn-searchLoc'(event) {
		var modal = $('#locationModal')
		const searchLoc = modal.find('.modal-body input').val();
		//console.log(searchLoc);

		var result = await Meteor.callPromise('getLatLng', searchLoc);
		var locLat = result.data.results[0].geometry.location.lat;
		var loclng = result.data.results[0].geometry.location.lng;
		//console.log("Second Try: "+ result.data.results[0].geometry.location.lat);

		//update google map
		GoogleMaps.maps.locMap.instance.setCenter({lat: locLat, lng: loclng});
		GoogleMaps.maps.locMap.instance.setZoom(15);

		Session.set('placeId', result.data.results[0].place_id);

	},

	//save trip in database (only if user is registered)
	'click .btn-saveTrip' (event) {
		//if there is existing, update
		//else add new entry
		var trip = Template.instance().trip.get();
		var tripReact = Template.instance().trip;
		var queryTrip = Trips.findOne( { _id: Template.instance().trip.get()._id } );
		if(queryTrip == undefined)
		{
			//create new
			Meteor.call('trips.add', trip, function(error, result) {
				tripReact.get()._id = result;
				tripReact.set(tripReact.get());
				alert("trip saved");
			});
			//set to currently saving UNTIL trip id is gotten from server
			tripReact.get()._id = "Currently Saving";
			tripReact.set(tripReact.get());
		}
		else
		{
			//update existing
			Meteor.call('trips.update', trip, function(error, result) {
				//set session state to complete.
				alert("trip saved");
			});
			//can set session.state to loading if want
		}
		console.log("Saving . . .");
	},

	//add new day to dayarray
	'click .btn-addDay' (event) {
		//add a new day to the dayArray.
		var trip = Template.instance().trip;
		trip.get().dayArray.push( [] );
		trip.set(trip.get());
	},
});

/*
	locationModalTemplate helper and events
*/

/*
	settingsModalTemplate helper and events
	//<!-- from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date -->
*/

//populate select
Template.settingsModalTemplate.onCreated(function() {
	//subscription
	this.countrySubscription = Meteor.subscribe('getCountry');
	var countrySubscription = this.countrySubscription;
	/* ======================================================
					Country List Initalization
	====================================================== */
	this.countryDropDown = new ReactiveVar();
	var countryDropDown = this.countryDropDown;
	//Get the list of countries first.
	this.autorun(function(autorunner) {
		//not yet subscribed, return
		if(! countrySubscription.ready())
			return;
		//else do this
		else
		{
			//load all the countries from db, put them into the array
			var countryObjectsFromDB = Country.find({}, {sort: {country_name: 1}} ).fetch();
			//if exist = not undefined
			if(countryObjectsFromDB != undefined)
			{
				var countryArray = [];
				countryObjectsFromDB.forEach(function(entry) {
					countryArray.push(entry.country_name);
				});
				countryDropDown.set(countryArray);
			}
			else
				console.log("invalid");
			autorunner.stop();
		}
	});
	//set these 2 for updating select options
	this.daysDropDown = new ReactiveVar();
	this.monthsDropDown = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	this.yearsDropDown = new ReactiveVar();

	//populate year till today + 50
	let yearCount = [];
	let today = new Date();
	for(var i = today.getFullYear(); i < (today.getFullYear() + 50); i++)
		yearCount.push(i);

	//initalise days and years
	this.daysDropDown.set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]);
	this.yearsDropDown.set(yearCount);

	//initialise validation for trip name and trip days
	this.tripNameValidation = new ReactiveVar();
	var tripNameValidation = this.tripNameValidation;
	this.countryDropDown = new ReactiveVar();
	var countryDropDown = this.countryDropDown;
});

Template.settingsModalTemplate.helpers({
	daysDropDown: function() {
		return Template.instance().daysDropDown.get();
	},
	monthsDropDown: function() {
		return Template.instance().monthsDropDown;
	},
	yearsDropDown: function() {
		return Template.instance().yearsDropDown.get();
	},
	countryDropDown: function() {
		return Template.instance().countryDropDown.get();
	},
	setSelected: function() {
		//just to ensure the starting value of the modal is the correct one, cant be done in show.bs.modal
		country.value = this.trip.get().country;
	}
});

Template.settingsModalTemplate.events({

	'show.bs.modal #settingsModal' (event) {
		//update date settings inside the modal
		Template.instance().find("#tripName").value = this.trip.get().tripName;
		var date = new Date(this.trip.get().startDate);
		Template.instance().find("#dateYear").value = date.getFullYear();
		Template.instance().find("#dateMonth").value = Template.instance().monthsDropDown[date.getMonth()];
		Template.instance().find("#dateDay").value = date.getDate();
		Template.instance().find("#dayNumbers").value = this.trip.get().dayArray.length;
	},

	//change date month and year -> check for 30/31 days and leapyear
	'change #dateMonth' (event) {
		//when date is changed, change the number of days in the day element
		//used this page => https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date
		var dayOptions = Template.instance().daysDropDown.get();
		var month = event.target.value;
		if(month ==='January' || month === 'March' || month === 'May' || month === 'July' || month === 'August' || month === 'October' || month === 'December') {
			while(dayOptions.length < 31)			{
				dayOptions.push(dayOptions[dayOptions.length-1] + 1);
			}
		}
		else if(month === 'April' || month === 'June' || month === 'September' || month === 'November') {
			if(dayOptions.length < 30) {
				while(dayOptions.length < 30)
					dayOptions.push(dayOptions[dayOptions.length-1] + 1);
			}
			else if(dayOptions.length > 30) {
				while(dayOptions.length > 30)
					dayOptions.splice(dayOptions.length-1);
			}
		}
		else
		{
		 	// If month is February, calculate whether it is a leap year or not
			//calculate leap year
			var year = Template.instance().find("#dateYear").value;
			if((year - 2016) % 4 === 0) {
				while(dayOptions.length > 29)
					dayOptions.splice(dayOptions.length-1);
			}
			else {
				while(dayOptions.length > 28)
					dayOptions.splice(dayOptions.length-1);
			}
		}
		Template.instance().daysDropDown.set(Template.instance().daysDropDown.get());
	},

	'change #dateYear' (event) {
		var month = Template.instance().find("#dateMonth").value;
		var dayOptions = Template.instance().daysDropDown.get();
		if(month === "February")
		{
			//check for leapyear
			if((event.target.value - 2016) % 4 === 0)
			{
				//increase day to 29 if not already.
				while(dayOptions.length < 29)
					dayOptions.push(dayOptions[dayOptions.length-1] + 1);
			}
			else
			{
				//reduce day to 28 if not already.
				while(dayOptions.length > 28)
					dayOptions.splice(dayOptions.length-1);
			}
		}
		Template.instance().daysDropDown.set(Template.instance().daysDropDown.get());
	},

	//validation for trip name - must not be empty
	'change #tripName' (event) {
		if(event.target.value == "")
		{
			if(!event.target.classList.contains("is-invalid"))
				event.target.classList.add("is-invalid");
		}
		else
		{
			if(event.target.classList.contains("is-invalid"))
				event.target.classList.remove("is-invalid");
		}
	},

	//validation for day numbers
	'change #dayNumbers' (event) {
		if(event.target.value > 365 || event.target.value < 0)
		{
			if(!event.target.classList.contains("is-invalid"))
				event.target.classList.add("is-invalid");
		}
		else
		{
			if(event.target.classList.contains("is-invalid"))
				event.target.classList.remove("is-invalid");
		}
	},

	'click .btn-saveSettings'(event) {
		//to do validation, remove data-dismiss of the button
		let invalidTripName = Template.instance().find("#tripName").classList.contains("is-invalid");
		let invalidDayNumbers = Template.instance().find("#dayNumbers").classList.contains("is-invalid");
		if(invalidTripName || invalidDayNumbers)
		{
			alert("Please check your entries!");
		}
		else
		{
			//fuck outta here
			var newStartDate = new Date(Template.instance().find("#dateYear").value, Template.instance().monthsDropDown.indexOf(Template.instance().find("#dateMonth").value), Template.instance().find("#dateDay").value, 0, 0, 0, 0);
			this.trip.get().startDate = newStartDate;
			//set the number of days to the trip.
			if(this.trip.get().dayArray.length < Template.instance().find("#dayNumbers").value)
				while(this.trip.get().dayArray.length < Template.instance().find("#dayNumbers").value)
					this.trip.get().dayArray.push([]);
			else if(this.trip.get().dayArray.length > Template.instance().find("#dayNumbers").value)
			{
				let daysToDecrease = this.trip.get().dayArray.length - Template.instance().find("#dayNumbers").value;
				this.trip.get().dayArray.splice(Template.instance().find("#dayNumbers").value, daysToDecrease);
			}
			//set country of interest
			this.trip.get().country = Template.instance().find("#country").value;
			//set tripname
			this.trip.get().tripName = Template.instance().find("#tripName").value;

			//set to update
			this.trip.set(this.trip.get());

			//close modal here
			$("#settingsModal").modal('hide');
		}
	}

});

/*
	dayTemplate helper and events
*/

Template.dayTemplate.helpers({
	//get day number
	getDayNum: function(ind) {
		return ind+1;
	},
});

Template.dayTemplate.events({
	//add a blank location.
	'click .btn-dayAddLoc' (event) {
		this.trip.get().dayArray[this.dayIndex].push("New Location");
		this.trip.set(this.trip.get());
	},
	//remove day
	'click .btn-dayRemoveDay' (event) {
		this.trip.get().dayArray.splice(this.dayIndex, 1);
		this.trip.set(this.trip.get());
	}
});

/*
	locationTemplate helper and events
*/

Template.locationTemplate.helpers({
	//set this index to ind+1
	getLocNum: function(index) {
		return index+1;
	},
	//get location from db, return location name.
	locationName: function() {
		return this;
	},

	getLocName() {
		var result = ReactiveMethod.call('getLocName', this.location);
		return result.data.result.name;
	},
});

Template.locationTemplate.events({
	//remove this location from trip.
	'click .btn-deleteLoc' (event) {
		this.trip.get().dayArray[this.dayIndex].splice(this.locIndex, 1);
		this.trip.set(this.trip.get());
	},
	//open the location modal
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
