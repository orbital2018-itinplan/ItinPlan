Template.loginNav.helpers({
	username: function() {
		//return Meteor.user().emails[0].address;
		return Meteor.user().username;
	},
});

Template.loginNav.events({
	'click #ddl-logout': ()=> {
		//get email
		console.log("logging out of user: " + Meteor.user().username);
		AccountsTemplates.logout();
		AccountsTemplates.setState("signIn");
	},

	'click #ddl-ViewDetails'(event) {
		FlowRouter.go('accounts');
		AccountsTemplates.setState("signIn");
	},

	'click #ddl-ResetPassword'(event) {
		FlowRouter.go('accounts');
		AccountsTemplates.setState("changePwd");
	},
});

Template.accountTemplate.helpers({
	detailsShow: function() {
		if(AccountsTemplates.getState() === "signIn")
			return true;
		else
			return false;
	},
	accountUsername: function() {
		return Meteor.user().username;
	},
	accountEmail: function() {
		return Meteor.user().emails[0].address;
	},
});