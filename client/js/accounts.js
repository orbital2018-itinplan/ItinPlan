Template.loginNav.helpers({
	username() {
		return Meteor.user().emails[0].address;
	}
});

Template.loginNav.events({
	'click .logout': ()=> {
		//get email
		console.log("logging out of user: " + Meteor.user().emails[0].address);
		AccountsTemplates.logout();
	}
});