import {Country} from '../../lib/models/db';
import {Session} from 'meteor/session'

Template.locationModalTemplate.onCreated(function() {
	// We can use the `ready` callback to interact with the map API once the map is ready.
	GoogleMaps.ready('locationMap', function (map) {
		// Add a marker to the map once it's ready
		// var marker = new google.maps.Marker({
		//     position: map.options.center,
		//     map: map.instance
		// });
		//console.log(GoogleMaps.maps.locationMap.places.Autocomplete(input));
		
	});

});



Template.locationModalTemplate.helpers({
	modalController: async function() {
		if(Session.get("currentLocation") == undefined || Session.get("currentLocation").row == -1)
			return;
		console.log(Session.get("currentLocation"));
		//when opening the modal, this will run (due to change in session.get())
		if(Template.instance().subscriptionsReady() && GoogleMaps.maps.locationMap != undefined)
		{
			if(Session.get("currentLocation").placeID == "")
			{
				//if location is empty, render the base location (country or custom)
				let countryName = this.trip.get().country;
				let country = Country.find({country_name: countryName}).fetch();
				if(country[0] != undefined)
				{
					GoogleMaps.maps.locationMap.instance.setOptions({
						center: new google.maps.LatLng(country[0].lat, country[0].lng),
						zoom: 6
					});
				}
				else
				{
					GoogleMaps.maps.locationMap.instance.setOptions({
						center: new google.maps.LatLng(0, 0),
						zoom: 2
					});
				}
			}
			else
			{
				//render placeID
				//search through db for location first.
				//if dont have, use google api 
				//for now, just google api first.
				let placeID = Session.get("currentLocation").placeID;
				//find in google.
				var result = await Meteor.callPromise('getPlace', placeID);
				console.log(result);
				try{
					console.log(result.data.result);
					var locLat = result.data.result.geometry.location.lat;
					var loclng = result.data.result.geometry.location.lng;
					//console.log("Second Try: "+ result.data.results[0].geometry.location.lat);

					//update google map
					GoogleMaps.maps.locationMap.instance.setCenter({lat: locLat, lng: loclng});
				} catch (err)
				{
					console.log(err);
				}
			}
		}
	},

	initialOptions: function () {
		//initialization for google map
		try {
            if (GoogleMaps.loaded()) {
				return {
					center: new google.maps.LatLng(0, 0),
					zoom: 1
				};
            }
		} catch(err) {
			console.log(err);
		}
	},

    searchSchema: function() {
        return Schemas.Search;
    },

	//Check if google map is loaded
	googleMapsReady : function() {
		return GoogleMaps.loaded();
	}
});

Template.locationModalTemplate.events({
	async 'click .btn-saveLoc'(event) {
		var modal = $('#locationModal')
		row = modal.data("row");
		col = modal.data("col");
		//console.log(modal.find('.modal-body input').val());
		console.log(Session.get('placeId'));


		//console.log(Template.instance().trip.get());
		this.trip.get().dayArray[row][col] = Session.get('placeId');
		this.trip.set(this.trip.get());
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
		GoogleMaps.maps.locationMap.instance.setCenter({lat: locLat, lng: loclng});
		GoogleMaps.maps.locationMap.instance.setZoom(15);

		Session.set('placeId', result.data.results[0].place_id);

	},

	'hide.bs.modal #locationModal'(event) {
		Session.set("currentLocation", { placeID: placeID, row: -1, col: -1 });
	}
});
