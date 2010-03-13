function(head, req) {
  // !json templates.index
  // !json notewiki
  // !code vendor/couchapp/path.js
  // !code helpers/template.js

  var recentPath = listPath('recent','recent',{descending:true, limit:20});
  var allPath = listPath('index','all');
  var homePath = showPath('page', 'FrontPage');

  // The provides function serves the format the client requests.
  // The first matching format is sent, so reordering functions changes 
  // thier priority. In this case HTML is the preferred format, so it comes first.
  provides("html", function() {
    // render the html head using a template
    send(template(templates.index.head, {
      wikiName : notewiki.name,
      description: notewiki.description,
      pageTitle : "All Pages",
      userName : req.userCtx && req.userCtx.name || "",
      newPagePath : showPath("edit"),
      recentPath : recentPath,
      allPath : allPath,
      assets : assetPath(),
      homePath : homePath
    }));

  // loop over view rows, rendering one at a time
  var row, key;
  var last_key = "";
  while (row = getRow()) {
    var page = row.value;
    key = row.key;
    if (last_key != key) {
      send("<h2>" + key + "</h2>");
    }
    last_key = key


      send(template(templates.index.row, {
        name : page.name,
        link : showPath("page", page.name),
        updated_at : page.updated_at
      }));
  }

  // render the html tail template
    return template(templates.index.tail, {
      assets : assetPath()
    });
  });

  };
