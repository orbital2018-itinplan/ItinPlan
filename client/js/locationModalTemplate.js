import {Country} from '../../lib/models/db';
import {Session} from 'meteor/session'

Template.locationModalTemplate.onCreated(function() {
	// We can use the `ready` callback to interact with the map API once the map is ready.
	GoogleMaps.ready('locMap', function (map) {
		// Add a marker to the map once it's ready
		// var marker = new google.maps.Marker({
		//     position: map.options.center,
		//     map: map.instance
		// });
		//console.log(GoogleMaps.maps.locMap.places.Autocomplete(input));
		
	});
	

});

Template.locationModalTemplate.helpers({
	locationMap: function () {
		//initialization for google map
		const countryName = this.trip.get().country;
		console.log(countryName);

		var country = Country.find({country_name: countryName}).fetch();
		//console.log("FROM DB:" + country[0].lat);
		try {
            if (GoogleMaps.loaded()) {
                // Map initialization options
                return {
                    center: new google.maps.LatLng(country[0].lat, country[0].lng),
                    zoom: 6
                };
            }
		} catch(err) {}

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
		GoogleMaps.maps.locMap.instance.setCenter({lat: locLat, lng: loclng});
		GoogleMaps.maps.locMap.instance.setZoom(15);

		Session.set('placeId', result.data.results[0].place_id);

	},
});
