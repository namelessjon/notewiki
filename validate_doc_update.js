function (newDoc, oldDoc, userCtx) {
  // !code helpers/validate.js

  // not logged in
  if (!userCtx.name) {
    forbidden("Sorry, you must be logged in to save this " + newDoc.type);
  }

  if (newDoc.created_at) dateFormat("created_at");

  if (newDoc.type == 'page') {
      require("created_at", "author", "body", "format", "name");
      assert(newDoc._id == newDoc.name, "Post name must be used as the _id");
  }

}
