function(doc) {
  if (doc.type == "page") {
    emit(doc.updated_at, {
      name : doc.name,
      author : doc.author,
      created_at : doc.created_at,
      updated_at : doc.updated_at
    });    
  }
};
