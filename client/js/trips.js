import {Trips} from '../../lib/models/db';

Template.myTrips.onCreated(function() {
    var tripSubscription = this.subscribe('trips');
    this.tripSubscription = tripSubscription;

    this.sortModifier = new ReactiveVar();
    this.filterModifier = new ReactiveVar();
});

Template.myTrips.helpers({
    tripSubscriptionReady: function() {
        return Template.instance().subscriptionsReady();
    },
    tripList: function() {
        //sort -1 = decending | 1 = ascending
        //{tripName: 1}
        //{startDate: 1}
        //{lastModified: 1}

        return Trips.find({ owner: Meteor.userId() }, { sort: {tripName: 1} });
    },
    startDate: function() {
		return new Date(this.startDate).toLocaleDateString('en-GB', {  day: 'numeric', month: 'long', year: 'numeric' });
    },
});

Template.myTrips.events({
    //go to /planner/?_id="ID".
	'click #btn-Planner' (event) {
        FlowRouter.go('/planner/?_id=' + this._id);
    },
    
    //to open the delete confirmation modal.
	'click #btn-Delete' (event) {
        var trip = this;
        $('#confirmationModal').one('show.bs.modal', function (event) {
            var modal = $(this);
            modal.data("trip", trip);
        });
	},

    //to delete. ((should have confirmation whether want to delete.))
	async 'click #btn-ConfirmDelete' (event) {
        let trip = $("#confirmationModal").data("trip");
        let noOfDeleted = Meteor.callPromise('trips.remove', trip);
        console.log("Deleting . . .");
	},
});