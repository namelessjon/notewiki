function(doc, req) {
  // !json templates.edit
  // !json couchapp
  // !code helpers/template.js
  // !code vendor/couchapp/path.js
  // !code helpers/json2.js

  var title = "";
  if (doc && doc._id) {
     title = "Editting "+doc._id;
     } else {
     title = "New Page";
  }
  // we only show http
  return template(templates.edit, {
      wikiName: couchapp.name,
      assets : assetPath(),
      pageTitle: title,
    userName: req.userCtx && req.userCtx.name || "",
      pageName: doc && doc.name || req.id || "",
      content: doc && doc.body || "",
      docid: JSON.stringify(doc && doc._id || null),
      newPagePath: showPath('edit', ""),
      editPagePath: showPath('edit', (doc && doc._id || ""))
  });
}
