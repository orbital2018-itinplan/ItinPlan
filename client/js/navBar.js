Template.navBar.events({
    'click '(event) {
        //to hide the navbar after clicking on it
        //console.log(Template.instance().find("#menuNavigation").classList);
        if(!event.target.classList.contains('dropdown-toggle'))
        {
            if(Template.instance().find("#menuNavigation").classList.contains("show"));
                //Template.instance().find("#menuNavigation").classList.remove("show");
                $("#menuNavigation").collapse('hide');
        }
	},
});