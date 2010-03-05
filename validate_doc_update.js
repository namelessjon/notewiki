function (newDoc, oldDoc, userCtx) {
  // !code helpers/validate.js

  // not logged in
  if (!userCtx.name) {
    forbidden("Sorry, you must be logged in to save this " + newDoc.type);
  }

  if (newDoc.created_at) dateFormat("created_at");

  if (newDoc.type == 'page') {
      require("created_at", "author", "body", "format", "name");
      assert(newDoc._id == newDoc.name, "Page name must be used as the _id");
      matches('name', /^[A-Z]\w\w+$/, "Page name can only contain A-Z, a-z, 0-9 and _.  It also has to begin with a captial");

      if (!isAdmin(userCtx)) unchanged('created_at');
  } else {
      if (!isAdmin(userCtx)) {
        forbidden("Sorry, you must be an admin to create a '"+newDoc.type+"' document");
      }
  }

}
