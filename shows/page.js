function(doc, req) {
  // !json templates.page
  // !json templates.layout
  // !json couchapp
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

  // we only show http
  return template(templates.layout, {
    extra_js: "",
    wikiName: couchapp.name,
    assets : assetPath(),
    content: template(templates.page, {
        name: doc.name,
        body: convert(doc.body)
    }),
    newPagePath: showPath('edit', ""),
    editPagePath: showPath('edit', doc._id)
  });
}
