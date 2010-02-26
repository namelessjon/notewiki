function(doc, req) {
  // !json templates.page
  // !json templates.layout
  // !json couchapp
  // !code helpers/template.js
  // !code vendor/couchapp/path.js

  if (null == doc) {
    // if we have no document.
    var last = req.path.pop()

    if (last != 'page') {
       return {
         code: "302",
         body: "page not found: '" + last + "'",
         headers: { "Location": showPath('edit', last)  }
       };
    }
  }

  // we only show http
  return template(templates.layout, {
    wikiName: couchapp.name,
//    title : doc.title,
//    blogName : blog.title,
//    post : doc.html,
//    date : doc.created_at,
//    author : doc.author,
    assets : assetPath(),
    content: template(templates.page, {})
//    editPostPath : showPath('edit', doc._id),
//    index : listPath('index','recent-posts',{descending:true, limit:5})
  });
}
