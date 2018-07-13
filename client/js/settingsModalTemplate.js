import {ReactiveVar} from 'meteor/reactive-var'
import {Trips} from '../../lib/models/db';
import {Country} from '../../lib/models/db';

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
	setCountrySelected: function() {
		//just to ensure the starting value of the modal is the correct one, cant be done in show.bs.modal
		country.value = this.trip.get().country;
	},
	isOwner: function() {
		//if dont have, return false
		if(this.trip.get() != undefined)
		{
			//if owner is user and trip id is not null = trip is saved in our db and setting can be adjusted
			if(Meteor.userId() == this.trip.get().owner && this.trip.get()._id != null)
				return true;
			else
				return false;
		}
		else
			return false;
	},
	publicTrip: function() {
		if(this.trip.get().public)
			return true;
		else
			return false;
	},
	shareURL: function() {
		return "www.itinplan.com/planner/?_id=" + this.trip.get()._id;
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

		//set public or private
		if(Meteor.userId() == this.trip.get().owner && this.trip.get()._id != null)
		{
			if(this.trip.get().public)
				Template.instance().find("#radio-PublicLabel").classList.add("active");
			else
				Template.instance().find("#radio-PrivateLabel").classList.add("active");
		}
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


			//save to db (EXACT COPY FROM btn-saveTrip BUT only for registered users)
			if(Meteor.user()) {
				//if there is existing, update
				//else add new entry
				var trip = this.trip.get();
				var tripReact = this.trip;
				var queryTrip = Trips.findOne( { _id: this.trip.get()._id } );
				if(queryTrip == undefined)
				{
					//create new
					Meteor.call('trips.add', trip, function(error, result) {
						tripReact.get()._id = result;
						tripReact.set(tripReact.get());
						//alert("Trip Saved");
						$('#saveTrip').modal("show");
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
						//alert("Trip Saved");
						$('#saveTrip').modal("show");
					});
					//can set session.state to loading if want
				}
				console.log("Saving . . .");
			}

			//close modal here
			$("#settingsModal").modal('hide');
		}
	},

	'change #publicSelector'(event) {
		//to set the trip to public or private
		if(event.target.id === "radio-Private")
			this.trip.get().public = false;
		else
			this.trip.get().public = true;
		this.trip.set(this.trip.get());

		//need to save to database immediately because this is public and private setter.
		//BUT IT ONLY SAVES THE PUBLIC OR PRIVATE ATTRIBUTE===============================IMPT
		if(Meteor.user()) {
			//if there is existing, update
			//else add new entry
			var trip = this.trip.get();
			var tripReact = this.trip;
			var queryTrip = Trips.findOne( { _id: this.trip.get()._id } );
			if(queryTrip == undefined)
			{
				//create new
				Meteor.call('trips.add', trip, function(error, result) {
					tripReact.get()._id = result;
					tripReact.set(tripReact.get());
					//alert("Trip Saved");
					//$('#saveTrip').modal("show");
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
					//alert("Trip Saved");
					//$('#saveTrip').modal("show");
				});
				//can set session.state to loading if want
			}
			console.log("Saving . . .");
		}

	},

	'click #btn-copyURL' (event) {
		//to copy the url
		let url = Template.instance().find("#shareURL");
		url.select();
		document.execCommand("copy");
		url.classList.add("is-valid");
	},

	'hide.bs.modal #settingsModal' (event) {
		//if i am owner of trip and it is public do all these.
		if(this.trip.get().public && Meteor.userId() == this.trip.get().owner)
		{
		 	if(Template.instance().find("#shareURL").classList.contains("is-valid"))
				Template.instance().find("#shareURL").classList.remove("is-valid");
		}
		if(Template.instance().find("#tripName").classList.contains("is-invalid"))
			Template.instance().find("#tripName").classList.remove("is-invalid");
		if(Template.instance().find("#dayNumbers").classList.contains("is-invalid"))
			Template.instance().find("#dayNumbers").classList.remove("is-invalid");
	},

});