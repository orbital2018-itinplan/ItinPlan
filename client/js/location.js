import {Meteor} from "meteor/meteor";

Template.location.onRendered(function(){

    let countrySel = FlowRouter.getQueryParam('country');
    console.log('/image/country/'+countrySel+'.jpg');

    $('.locationHeader').css('background-image', 'linear-gradient(rgba(0, 0, 0, 0.25),rgba(0, 0, 0, 0.25)), url("/image/country/'+countrySel+'.jpg")');

});

Template.location.helpers({
    country: function() {
        return FlowRouter.getQueryParam('country');
    }
})