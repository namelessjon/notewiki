$.couch.app(function(app) {
  // setup the account and profile widgets
  // extend the vendor profile widget with Toast specific code
  var acct = $.extend(true, {},
    app.ddoc.vendor.couchapp.evently.account,
    app.ddoc.evently.account);
  $("#account").evently(acct, app);

//  $("#profile").evently(app.ddoc.vendor.couchapp.evently.profile, app);

//  $.evently.connect($("#account"), $("#profile"), ["loggedIn", "loggedOut"]);

});
