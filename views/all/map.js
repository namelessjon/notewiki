function(doc) {
  if (doc.type == "page") {
    emit(doc.name[0], {
      name : doc.name,
      updated_at : doc.updated_at
    });    
  }
};
