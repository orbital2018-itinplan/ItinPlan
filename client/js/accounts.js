Template.loginNav.helpers({
	username: function() {
		//return Meteor.user().emails[0].address;
		return Meteor.user().username;
	},
});

Template.loginNav.events({
	'click #btn-Login'(event) {
		FlowRouter.go('accounts');
		AccountsTemplates.setState("signIn");
	},

	'click #ddl-logout'(event) {
		//get email
		console.log("logging out of user: " + Meteor.user().username);
		AccountsTemplates.logout();
		AccountsTemplates.setState("signIn");
	},

	'click #ddl-ViewDetails'(event) {
		FlowRouter.go('accounts');
		AccountsTemplates.setState("signIn");
	},

	'click #ddl-ChangePassword'(event) {
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

Template.accountTemplate.events({
	'click #btn-ChangePassword'(event) {
		FlowRouter.go('accounts');
		AccountsTemplates.setState("changePwd");
	},
})
