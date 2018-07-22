import { Locations } from "../../lib/models/db";

Template.locationTemplate.onCreated(function() {
	this.locationObject = new ReactiveVar();

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
		
		var result = Locations.findOne( { _id: this.location } );

		if(result == undefined)
			Meteor.call('addPlace', this.location);
		else
		{	
			Template.instance().locationObject.set(result);
			return result.name;
		}
		//return this.location;
	},
	locationAddress: function() {
		if(Template.instance().locationObject.get() == undefined)
			return "";
		else
			return Template.instance().locationObject.get().formatted_address;
	},
	locationImageURL() {
		if(Template.instance().locationObject.get() == undefined)
		{
			return "/image/blank.jpg";
		}
		else
		{
			let coordinates = Template.instance().locationObject.get().geometry.location;
			return "https://maps.googleapis.com/maps/api/staticmap?center=" + coordinates.lat + "," + coordinates.lng + "&zoom=17&size=500x300&markers=size:mid%7C" + coordinates.lat + "," + coordinates.lng + "&key=AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo"
		}
	},
	getLocName() {
		try {
            var result = ReactiveMethod.call('getLocName', this.location);
            return result.data.result.name;
		} catch (err){

		}

	}
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
		placeID = this.location;
		Session.set("currentLocation", { placeID: placeID, row: dayIndex, col: locIndex });
		//set reactive var pair for locationModalTemplate to render google maps.
		//open a javascript modal thing
		//gotten from bootstrap https://getbootstrap.com/docs/4.0/components/modal/?#varying-modal-content
		//$('#locationModal').one('show.bs.modal', function (event) {

			/*not nice implementation. fix with session variable @yuanrong
			var button = $(event.relatedTarget); // Button that triggered the modal
			var location = button.data('location'); // Extract info from data-* attributes
			// If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
			// Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
			var modal = $(this);
			modal.find('.modal-body input').val(location);
			console.log(modal.data());
			//set row and column for later setting data
			modal.data("row", dayIndex);
			modal.data("col", locIndex);*/
			
			//set the session variable "currentLocation" to the placeid and row and col, allow the modal to edit.
			
		//})
	}
});