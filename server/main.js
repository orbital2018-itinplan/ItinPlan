import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';

//get db stuff
import {Country} from '../lib/models/db';
import {Trips} from '../lib/models/db';
import {Location} from '../lib/models/db';


const initialise = function () {
    console.log("-------INITIALISING STARTED--------");

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

    } /* else {    ===============//comment out so dun keep using api ============================
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
    }*/
};

Meteor.startup(() => {

    initialise();
    //Meteor.setInterval(initialise, 300000);

    Meteor.methods({
        'getLatLng': function(searchLoc){

            const APIkey = "AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo";
            const url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + searchLoc + "&key=" + APIkey + "";

            const result = HTTP.get(url, {});
            //console.log(result.data.results[0]);
            return result;
        },

        'getLocName': function(placeId){
            const APIkey = "AIzaSyDz0qhkNsfhQiY9mXJkPqWsJuUENw4zTxo";
            const url = "https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeId+"&key=" + APIkey + "";


            const result = HTTP.get(url, {});
            return result;
        }
    });

    Meteor.publish('getCountry', function () {
        return Country.find({});
    });

    // This code only runs on the server
    Meteor.publish('trips', function() {
        return Trips.find({
            owner: this.userId //<-- use only when nid to filter by user
        });
    });

    Meteor.publish('location', function() {
        return Location.find({});
    });
});
