FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'home'});
    }
});

FlowRouter.route('/destination', {
    name: 'destination',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'destination'});
    }
});

FlowRouter.route('/myTrips', {
    name: 'mytrips',
    action() {
        if(Meteor.userId())
            BlazeLayout.render('main', {navBar: 'navBar', content: 'myTrips'});
        else
            FlowRouter.go('invalid');
    }
});

FlowRouter.route('/account', {
    name: 'accounts',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'account'});
    }
});

FlowRouter.route('/planner', {
    name: 'planner',
    action(queryParams) {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'planner'});
    }
});

FlowRouter.route('/location', {
    name: 'location',
    action(queryParams) {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'location'});
    }
});



FlowRouter.notFound = {
    name: 'invalid',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'invalid'});
    }
};