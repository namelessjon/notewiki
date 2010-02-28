function(doc, req) {
  // !json templates.edit
  // !json templates.edit_js
  // !json templates.layout
  // !json couchapp
  // !code helpers/template.js
  // !code vendor/couchapp/path.js
  // !code helpers/json2.js

  // we only show http
  return template(templates.layout, {
    wikiName: couchapp.name,
    assets : assetPath(),
    content: template(templates.edit, {
        pageName: req.id || "",
        docid: JSON.stringify(doc && doc._id || null)
    }),
    extra_js: template(templates.edit_js, {
        assets : assetPath(),
        docid: JSON.stringify(doc && doc._id || null)
    }),
    newPagePath: showPath('edit', "")
  });
}
