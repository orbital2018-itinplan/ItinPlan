import { Meteor } from "meteor/meteor";
import {Trips} from '../../lib/models/db';
import { Locations } from "../../lib/models/db";
import {Country} from '../../lib/models/db';


Template.location.onRendered(function(){

    let countrySel = FlowRouter.getQueryParam('country');
    Meteor.subscribe('getTrips');
    Meteor.subscribe('locations');
    //console.log('/image/country/'+countrySel+'.jpg');

    $('.locationHeader').css('background-image', 'linear-gradient(rgba(0, 0, 0, 0.25),rgba(0, 0, 0, 0.25)), url("/image/country/'+countrySel+'.jpg")');

});

Template.location.helpers({
    country: function() {
        return FlowRouter.getQueryParam('country');
    },
    //retrieve: location for selected country
    locations: function() {
        let locationList = [];
        //locationList.push({'name': 'Yuanrong', 'address': 'Singapore'});
        let country = FlowRouter.getQueryParam('country');
        let placeIdList = Trips.find({country: country}, {fields: {dayArray: 1}}, {sort : {expireAt: -1}}).fetch();

        //for each dayArray loop through to get all location and check if got repeating before sending back
        for( var x in placeIdList){
            let tripDayArray = placeIdList[x].dayArray;
            for (var y in tripDayArray){
                let singleDay = tripDayArray[y];
                for (var z in singleDay){
                    let placeId = singleDay[z];
                    //check for empty placeID
                    if(placeId == "New Location" || !placeId) {
                        console.log("No placeId");
                    } else {
                        let location = Locations.find({_id: placeId}).fetch();
                        //check for expired location
                        if(location == undefined){
                            console.log("Expired");
                        } else {
                            let name = location[0].name;
                            let address = location[0].formatted_address;
                            //check for duplicate records
                            if (locationList.some(e => e.name === name)) {
                                console.log("Duplicated");
                            } else {
                                locationList.push({'name': name, 'address': address});
                            }
                        }
                    }
                }
            }
        }

        return locationList;
    }
})

Template.location.events({
    'click .btn-moreInfo' (event) {
        window.open('http://google.com/search?q=' + this.address);
    }
})