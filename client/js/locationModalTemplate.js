import {Country} from '../../lib/models/db';
import {Session} from 'meteor/session'

Template.locationModalTemplate.onCreated(function() {
	// We can use the `ready` callback to interact with the map API once the map is ready.
	var template = Template.instance();

	//expose markers for initialization when showing modal
	this.markers = new ReactiveVar();
	var markers = this.markers;

	GoogleMaps.ready('locationMap', function (map) {
		console.log("GOOGLE MAP READY");
		//marker will change for every one
		
		//set the autocomplete input for use by googlemaps.
		let input = template.find('#input-placeAutocomplete');
		var autocomplete = new google.maps.places.Autocomplete(input);
		autocomplete.bindTo('bounds', map.instance);

		//set the infowindow for use by googlemaps.
		let infoWindowHTML = template.find('#infowindow-content');
		var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(infoWindowHTML);

		//to set the map for the markers
		let markerVar = markers.get();
		markerVar.setMap(map.instance);
		
		autocomplete.addListener('place_changed', function() {
			var place = autocomplete.getPlace();
			if (!place.geometry) {
				return;
			}
			//make the map centered on the place
			if (place.geometry.viewport) {
				map.instance.fitBounds(place.geometry.viewport);
			} 
			else {
				map.instance.setCenter(place.geometry.location);
				map.instance.setZoom(17);
			}

			//Set the position of the marker using the place ID and location.
			let markerVar = markers.get();
			markerVar.setPlace({
				placeId: place.place_id,
				location: place.geometry.location
			});
			markerVar.setVisible(true);

			//set the text content of infowindowhtml and open the information window
			infoWindowHTML.children['place-name'].textContent = place.name;
			infoWindowHTML.children['place-address'].textContent = place.formatted_address;
			infoWindow.open(map.instance, markerVar);

			//set the name of the place = can change to reactive?
			template.find("#locationToSave").value = place.name;
		});
	});
	
});

Template.locationModalTemplate.helpers({
	//initial options of map
	initialOptions: function () {
		//initialization for google map
		try {
            if (GoogleMaps.loaded()) {
				//set the reactive variable for markers
				Template.instance().markers.set(new google.maps.Marker({ clickable: false }));
				return {
					//clickableIcons: false,
					center: new google.maps.LatLng(0, 0),
					zoom: 3,
					minZoom: 3,
					maxZoom: 18
				};
            }
		} catch(err) {
			console.log(err);
		}
	},

	getMarkerName: function() {
		let marker = Template.instance().markers.get();
		//todo later
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

		let currentLocation = Session.get("currentLocation");
		let marker = Template.instance().markers.get();
		console.log(currentLocation.row);
		if(currentLocation.placeID != marker.place.placeId)
		{
			console.log("LOL");
			let row = currentLocation.row;
			let col = currentLocation.col;

			this.trip.get().dayArray[row][col] = marker.place.placeId;
			this.trip.set(this.trip.get());
		}
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

	//when open modal
	async 'show.bs.modal #locationModal'(event) {
		if(Session.get("currentLocation").row == -1)
			return;
		else
		{
			//console.log(Session.get("currentLocation"));
			//when opening the modal, this will run (due to change in session.get())
			if(Template.instance().subscriptionsReady() && GoogleMaps.maps.locationMap != undefined)
			{
				let markers = Template.instance().markers;
				let template = Template.instance();
				//marker.setMap(GoogleMaps.maps.locationMap.instance);
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
					var result = await Meteor.callPromise('getPlace', placeID);				
					var center = result.data.result.geometry.location;
					//update google map
					GoogleMaps.maps.locationMap.instance.setCenter(center);
					GoogleMaps.maps.locationMap.instance.setZoom(17);

					//set reactive marker in the modal
					var reactiveMarkers = markers.get();
					reactiveMarkers.setPlace({
						placeId: placeID,
						location: center,
					});
					reactiveMarkers.setVisible(true);
					markers.set(reactiveMarkers);

					//save the name = can change to reactive?
					template.find("#locationToSave").value = result.data.result.name;
					
				}
			}
			return;
		}
	},

	//when close modal
	'hidden.bs.modal #locationModal'(event) {
		Session.set("currentLocation", { placeID: placeID, row: -1, col: -1 });
		var reactiveMarkers = Template.instance().markers.get();
		reactiveMarkers.setVisible(false);
		Template.instance().find("#input-placeAutocomplete").value = "";
		Template.instance().find("#locationToSave").value = "";
	}
});
