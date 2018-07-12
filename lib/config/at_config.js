//this sets log out to go whichever route
var myPostLogout = function(){
    //example redirect after logout
    FlowRouter.go('/');
};

var mySubmitFunc = function(error, state){
  if (!error) {
    if (state === "signUp") {
      FlowRouter.go('/');
    }
  }
};

//reordering account entry fields
var email = AccountsTemplates.removeField('email');
var password = AccountsTemplates.removeField('password');
AccountsTemplates.addFields([
  {
    _id: "username",
    type: "text",
    displayName: "username",
    required: true,
    minLength: 5,
    lowercase: true,
  },
  email,
  password
]);

// Options
AccountsTemplates.configure({
  showLabels: false,
  lowercaseUsername: true, 
  enablePasswordChange: true,
  continuousValidation: true,
  negativeFeedback: true,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,
  
  onLogoutHook: myPostLogout,
  onSubmitHook: mySubmitFunc,

  texts: {
    errors: {
        loginForbidden: "error.accounts.Invalid username or password!",
    }
  }
  //confirmPassword: false,
  //continuousValidation: false,
  //displayFormLabels: true,
  //forbidClientAccountCreation: true,
  //formValidationFeedback: true,
  //homeRoutePath: '/',
  //showAddRemoveServices: false,
  //showPlaceholders: true,
  //showValidating: true,
  //overrideLoginErrors: true,
  
  
});

//this set the hook for logout, can add more for login stuff etc

