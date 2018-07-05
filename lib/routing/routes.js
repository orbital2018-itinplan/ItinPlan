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
        BlazeLayout.render('main', {navBar: 'navBar', content: 'myTrips'});
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

FlowRouter.notFound = {
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'invalid'});
    }
};