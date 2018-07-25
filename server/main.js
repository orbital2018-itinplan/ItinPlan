import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';

//get db stuff
import {Country} from '../lib/models/db';
import {Trips} from '../lib/models/db';
import {Locations} from '../lib/models/db';


const initialise = function () {
    const APIKey = "AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo";
    console.log("-------INITIALISING STARTED--------");
    
    //set expiry for location in db
    Locations.rawCollection().createIndex(
        { "expireAt": 1 },
        { expireAfterSeconds: 0 }
    );

    if (Country.find().count() === 0) {
        //Insert sample data as collection is empty
        var arr = [{"country": "Australia"}, {"country": "China"},
            {"country": "France"}, {"country": "Germany"},
            {"country": "Indonesia"}, {"country": "Italy"},
            {"country": "Japan"}, {"country": "Mexico"},
            {"country": "South Korea"}, {"country": "Taiwan"},
            {"country": "Thailand"}, {"country": "Vietnam"}];
        const keys = "AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo";

        console.log("-------INSERTING INTO DATABASE-----------");
        for (var i = 0; i < arr.length; i++) {
            const where = arr[i].country;
            console.log(where);
            const url2 = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + where + "&key=" + keys + "";
            const result = HTTP.get(url2, {});
            //DATA to be stored in mongoDB
            const place = result.data.results[0].name;
            //console.log("LOCATION NAME STORED: " + place);
            const photoReference = result.data.results[0].photos[0].photo_reference;
            //console.log("PHOTO STORED:" + photoReference);
            const lat = result.data.results[0].geometry.location.lat;
            //console.log("Lat Stored: " + lat);
            const lng = result.data.results[0].geometry.location.lng;
            console.log("----------------------------");

            Country.insert({country_name: place, photo_reference: photoReference, lat: lat, lng: lng});
        }

    }  /*else {    //===============//comment out so dun keep using api ============================
        //Update country collection
        Country.find({}, {sort: {country_name: 1}}).forEach(function (obj) {
            const country = (obj.country_name).toString();
            console.log("UPDATING COUNTRY: " + country);
            try {
                console.log("RETRIEVING DATA FROM API");
                //variables
                const APIkey = "AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo";
                const url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + country + "&key=" + APIkey + "";

                const result = HTTP.get(url, {});
                //console.log(result.data.results[0]);

                //DATA to be stored in mongoDB
                const place = result.data.results[0].name;
                //console.log("LOCATION NAME STORED: " + place);
                const photoReference = result.data.results[0].photos[0].photo_reference;
                //console.log("PHOTO STORED:" + photoReference);
                const lat = result.data.results[0].geometry.location.lat;
                //console.log("Lat Stored: " + lat);
                const lng = result.data.results[0].geometry.location.lng;
                console.log("----------------------------");


                try {
                    //console.log("------UPDATE DATABASE--------");
                    //console.log("Name: " + place);
                    //console.log("Reference: " + photoReference);
                    Country.update({country_name: place}, {$set: {photo_reference: photoReference, lat: lat, lng: lng}});
                } catch (error) {
                    console.log("ERROR :" + error);
                }

            } catch (err) {
                console.log("RETRIEVE ERROR :" + err);
            }
        });
    }//*/
};

Meteor.startup(() => {
    const APIkey = "AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo";
    initialise();
    //Meteor.setInterval(initialise, 300000);
    
    Meteor.methods({
        'getLatLng': function(searchLoc){
            const url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + searchLoc + "&key=" + APIkey + "";

            const result = HTTP.get(url, {});
            //console.log(result.data.results[0]);
            return result;
        },

        'getLocName': function(placeId){
            const url = "https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeId+"&key=" + APIkey + "";

            const result = HTTP.get(url, {});
            return result;
        },

        'getPlace': function(placeId) {

            //search for location in server db
            let locationQuery = Locations.findOne( { _id : placeId } );

            if(locationQuery == undefined)
            {
                try
                {
                    let url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&fields=" + "name,formatted_address,geometry,photo" + "&key=" + APIkey + "";

                    //once save location, search and save in server db
                    //server db sync with user db.
                    //upon opening, just search in own db, if cant find, getplace
                    //if dont find in server db, closing will save it.

                    var result = HTTP.get(url, {});

                    //ensure photo exists
                    let photo;
                    if(result.data.result.photos == undefined)
                        photo = "";
                    else
                        photo = result.data.result.photos[0];

                    let data = {
                        name: result.data.result.name,
                        geometry: result.data.result.geometry,
                        formatted_address: result.data.result.formatted_address,
                        photo: photo,
                    }
                    return data;

                }
                catch (ex)
                {
                    console.log("invalid request from google api - cannot add location");
                    return "";
                }
            }
            else
                return locationQuery;
                
        },

        //can use getplace method inside addplace?
        'addPlace': function(placeId) {
            //use server to get the place details, then add into the 

            let date = new Date();
            date.setDate(date.getDate()+7);

            if(placeId == "")
                return;

            //search for location in server db
            let locationQuery = Locations.findOne( { _id : placeId } );

            if(locationQuery == undefined)
            {
                try
                {
                    //if location is not in main DB
                    let url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&fields=" + "name,formatted_address,geometry,photo" + "&key=" + APIkey + "";
                    var result = HTTP.get(url, {}).data.result;
                    //ensure photo exists
                    let photo;
                    if(result.photos == undefined)
                        photo = "";
                    else
                        photo = result.photos[0];

                    Locations.insert({
                        _id: placeId,
                        name: result.name,
                        geometry: result.geometry,
                        formatted_address: result.formatted_address,
                        photo: photo,
                        expireAt: date,
                    });
                }
                catch (ex)
                {
                    console.log("invalid request from google api - cannot add location");
                }
            }
            else
            {
                //update locationQuery date
                locationQuery.expireAt = date;
                Locations.update( { _id: placeId }, locationQuery );
            }
        }
    });

    Meteor.publish('getCountry', function () {
        return Country.find({});
    });

    // This code only runs on the server
    Meteor.publish('trips', function() {
        return Trips.find({
            //owner: this.userId //<-- use only when nid to filter by user
            $or: [{owner: this.userId}, {public: true}]
        });
    });

    Meteor.publish('locations', function() {
        return Locations.find({});
    });

    Meteor.publish('getTrips', function(){
        return Trips.find({});
    })
});
