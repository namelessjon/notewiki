function(doc, req) {
  // !json templates.page
  // !json notewiki
  // !code helpers/template.js
  // !code helpers/textile.js
  // !code vendor/couchapp/path.js

  if (null == doc) {
    if (req.id) {
       return {
         code: "302",
         body: "page not found: '" + req.id + "'",
         headers: { "Location": showPath('edit', req.id)  }
       };
    }
  }

  var recentPath = listPath('recent','recent',{descending:true, limit:20});

  // we only show http
  return template(templates.page, {
    wikiName: notewiki.name,
    description: notewiki.description,
    assets : assetPath(),
    pageTitle: doc.name,
    userName: req.userCtx && req.userCtx.name || "",
    content: convert(doc.body),
    newPagePath: showPath('edit', ""),
    editPagePath: showPath('edit', doc._id),
    recentPath : recentPath
  });
}
