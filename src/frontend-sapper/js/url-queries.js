function getUrlQueries() {
  let queries = {};
  var location = '' + window.location;
  var queryString = location.split('?');
  if (queryString.length == 2) {
    queryString = queryString[1];
    var temp = queryString.split('&');
    var query;
    for (var i in temp) {
      query = temp[i].split('=');
      if (query.length == 2) {
        queries[query[0]] = decodeURIComponent(query[1]);
      } else {
        console.error('Bad query: ' + temp[i]);
      }
    }
  }
  return queries;
}

const UrlQueries = {
  get: getUrlQueries,
}

module.exports = UrlQueries;