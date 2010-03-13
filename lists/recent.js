function(head, req) {
  // !json templates.recent
  // !json notewiki
  // !code vendor/couchapp/path.js
  // !code helpers/template.js

  var recentPath = listPath('recent','recent',{descending:true, limit:20});
  var allPath = listPath('index','all');
  var homePath = showPath('page', notewiki.homepage);

  // The provides function serves the format the client requests.
  // The first matching format is sent, so reordering functions changes 
  // thier priority. In this case HTML is the preferred format, so it comes first.
  provides("html", function() {
    // render the html head using a template
    send(template(templates.recent.head, {
      wikiName : notewiki.name,
      description: notewiki.description,
      pageTitle : "Recent Changes",
      userName : req.userCtx && req.userCtx.name || "",
      newPagePath : showPath("edit"),
      recentPath : recentPath,
      allPath : allPath,
      assets : assetPath(),
      homePath : homePath
    }));

  // loop over view rows, rendering one at a time
  var row, key;
  while (row = getRow()) {
    var page = row.value;
    key = row.key;
      send(template(templates.recent.row, {
        name : page.name,
        link : showPath("page", page.name),
        author : page.author,
        updated_at : page.updated_at
      }));
  }

  // render the html tail template
    return template(templates.recent.tail, {
      assets : assetPath()
    });
  });

  };
