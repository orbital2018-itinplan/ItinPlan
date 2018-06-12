FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'home'});
        console.log(FlowRouter.getRouteName());
    }
});

FlowRouter.route('/destination', {
    name: 'destination',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'App_notFound'});
    }
});

FlowRouter.route('/myTrip', {
    name: 'mytrips',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar'});

    }
});

FlowRouter.route('/account', {
    name: 'accounts',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'account'});
        console.log(FlowRouter.getRouteName());
    }
});

FlowRouter.route('/planner', {
    name: 'planner',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar', content: 'planner'});
    }
});

