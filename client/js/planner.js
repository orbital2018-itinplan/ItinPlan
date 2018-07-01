import {ReactiveVar} from 'meteor/reactive-var'
import {Trips} from '../../lib/models/db';
import {HTTP} from 'meteor/http';
import {Location} from '../../lib/models/db';
import {Country} from '../../lib/models/db';
import {Session} from 'meteor/session'


Template.planner.onCreated(function () {

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('locMap', function (map) {
        // Add a marker to the map once it's ready
        // var marker = new google.maps.Marker({
        //     position: map.options.center,
        //     map: map.instance
        // });
    });

    var subscription = Meteor.subscribe('trips');
    Meteor.subscribe('getCountry');

    //change this to session variable later. (tested session variable, abit iffy)
    this.trip = new ReactiveVar();
    var trip = this.trip;

    //eg /?_id=new&country=mexico, _id = new, country = mexico
    if (FlowRouter.getQueryParam('_id') == "new") {
        //new trip
        console.log(Meteor.userId());
        let countryEntered = FlowRouter.getQueryParam('country');
        if (countryEntered == undefined)
            countryEntered = "South Korea";
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
    else if (FlowRouter.getQueryParam('_id') == undefined) {
        //current existing trip being edited
        //Session.set('trip', JSON.parse(localStorage.getItem('trip')));
        trip.set(JSON.parse(localStorage.getItem('trip')));
        if (Meteor.userId()) {
            trip.get().owner = Meteor.userId();
            trip.set(trip.get());
        }
    }
    else {
        //load a trip from db
        this.autorun(function (autorunner) {
            //not yet subscribed, return
            if (!subscription.ready())
                return;
            //else do this
            else {
                var queryTrip = Trips.findOne({_id: FlowRouter.getQueryParam('_id')});//.fetch()[0];
                //console.log(trip);
                //if exist = not undefined
                if (queryTrip != undefined)
                //Session.set('trip', queryTrip);
                    trip.set(queryTrip);
                else
                    console.log("invalid");
                autorunner.stop();
            }
        });
    }

});

Template.planner.helpers({

    //check trip
    haveTrip: function () {
        var trip = Template.instance().trip.get();
        if (trip == undefined) {
            //console.log("no trip yet");
            return false;
        }
        else {
            //console.log("trip gotten");
            return true;
        }
    },

    //get trip will have gotten the trip, so return the trip array
    tripDays() {
        return Template.instance().trip.get().dayArray;
    },

    tripCountry: function () {
        return Template.instance().trip.get().country;
    },

    tripStartDate: function () {
        return Template.instance().trip.get().startDate;
    },

    tripId: function () {
        //to return nullvalue
        if (Template.instance().trip.get() == undefined)
            return "";
        return Template.instance().trip.get()._id;
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

    checkLoginAndData: function () {
        var value = (Template.instance().subscriptionsReady() && Meteor.userId() != null)
        return value;
    },

    reactiveTrip: function () {
        //pass on reactive trip to children templates
        return Template.instance().trip;
    },

    localStorageTrip: function () {
        localStorage.setItem('trip', JSON.stringify(Template.instance().trip.get()));
        console.log("Trip saved");
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

    async 'click/touchstart .btn-saveLoc'(event) {
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

    async 'click/touchstart .btn-searchLoc'(event) {
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

    'click/touchstart .btn-saveTrip'(event) {
        //if there is existing, update
        //else add new entry
        var trip = Template.instance().trip.get();
        var tripReact = Template.instance().trip;
        var queryTrip = Trips.findOne({_id: Template.instance().trip.get()._id});
        if (queryTrip == undefined) {
            //create new
            Meteor.call('trips.add', trip, function (error, result) {
                tripReact.get()._id = result;
                tripReact.set(tripReact.get());
                console.log(tripReact.get());
                console.log(result);
            });
            //set to currently saving UNTIL trip id is gotten from server
            tripReact.get()._id = "Currently Saving";
            tripReact.set(tripReact.get());
        }
        else {
            //update existing
            Meteor.call('trips.update', trip, function (error, result) {
                //set session state to complete.
                console.log(result);
            });
            //can set session.state to loading if want
            console.log("UPDATING");
        }
    },

    'click/touchstart .btn-addDay'(event) {
        //add a new day to the dayArray.

        var trip = Template.instance().trip;
        trip.get().dayArray.push([]);
        trip.set(trip.get());

        console.log("Added new day");
    }
});

Template.dayTemplate.helpers({

    getDayNum: function (ind) {
        return ind + 1;
    },

});

Template.dayTemplate.events({
    'click/touchstart .btn-dayAddLoc'(event) {
        //add a blank location.
        this.trip.get().dayArray[this.dayIndex].push("Select Location");
        this.trip.set(this.trip.get());
    },

    'click/touchstart .btn-dayRemoveDay'(event) {
        //remove day
        this.trip.get().dayArray.splice(this.dayIndex, 1);
        this.trip.set(this.trip.get());
    }
});


Template.locationTemplate.helpers({
    //set this index to ind+1
    getLocNum: function (index) {
        return index + 1;
    },

    locationName: function () {
        //get location from db, return location name.
        console.log(this);
        return this;
    },

    getLocName(placeId) {
        var result = ReactiveMethod.call('getLocName', placeId);
        return result.data.result.name;
    },

    getLocImage(placeId) {

    }
});

Template.locationTemplate.events({
    'click/touchstart .btn-deleteLoc'(event) {
        //remove from object.
        this.trip.get().dayArray[this.dayIndex].splice(this.locIndex, 1);
        this.trip.set(this.trip.get());
    },

    'click/touchstart .btn-selectLoc'(event) {
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

