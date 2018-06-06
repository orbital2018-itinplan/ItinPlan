FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar-home', content: 'home'});
    }
});

FlowRouter.route('/destination', {
    name: 'destination',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar-destination'});
    }
});

FlowRouter.route('/myTrip', {
    name: 'destination',
    action() {
        BlazeLayout.render('main', {navBar: 'navBar-myTrip'});
    }
});
