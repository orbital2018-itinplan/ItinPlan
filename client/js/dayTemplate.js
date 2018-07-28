/*
	dayTemplate helper and events
*/

Template.dayTemplate.helpers({
	//get day number
	getDayNum: function(ind) {
		return ind+1;
	},
});

Template.dayTemplate.events({
	//add a blank location.
	'click .btn-dayAddLoc' (event) {
		this.trip.get().dayArray[this.dayIndex].push("");
		this.trip.set(this.trip.get());
	},
	//remove day
	'click .btn-dayRemoveDay' (event) {
		this.trip.get().dayArray.splice(this.dayIndex, 1);
		this.trip.set(this.trip.get());
	},
	//change icon for collapse day
	'click .btn-collapseDay' (event) {
        const day = this.dayIndex + 1;
        //collapse
		if($(".icon-collapse-"+day).hasClass("fa-minus-square-o")){
            $(".icon-collapse-"+day).removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
            $(".btn-no-"+day).removeClass("btn-primary").addClass("btn-secondary");
            console.log("Found minus");
		} else {
			//expand
            $(".icon-collapse-"+day).removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
            $(".btn-no-"+day).removeClass("btn-secondary").addClass("btn-primary");
            console.log("Found plus");

		}
	}
});