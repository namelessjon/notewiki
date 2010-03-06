function(doc, req) {
  // !json templates.edit
  // !json notewiki
  // !code helpers/template.js
  // !code vendor/couchapp/path.js
  // !code helpers/json2.js

  var title = "";
  if (doc && doc._id) {
     title = "Editting "+doc._id;
     } else {
     title = "New Page";
  }


  var recentPath = listPath('recent','recent',{descending:true, limit:20});
  var allPath = listPath('index','all');

  // we only show http
  return template(templates.edit, {
      wikiName: notewiki.name,
      description: notewiki.description,
      assets : assetPath(),
      pageTitle: title,
      userName: req.userCtx && req.userCtx.name || "",
      pageName: doc && doc.name || req.id || "",
      content: doc && doc.body || "",
      docid: JSON.stringify(doc && doc._id || null),
      newPagePath: showPath('edit', ""),
      editPagePath: showPath('edit', (doc && doc._id || "")),
      allPath : allPath,
      recentPath : recentPath
  });
}
