// sample function
const Fuse = require('./fuse')
let searchIndex = require('./searchIndex.json') // eslint-disable-line node/no-missing-require
searchIndex = Object.entries(searchIndex).map(([k, v]) => {
  return {
    path: k,
    text: v,
  }
})
var options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['path', 'text'],
}
var fuse = new Fuse(searchIndex, options)

exports.handler = async event => {
  const searchTerm = event.queryStringParameters.search || event.queryStringParameters.s
  if (typeof searchTerm === 'undefined') {
    return {
      statusCode: 400,
      body: 'no search term specified, query this function with /?search=searchTerm or /?s=searchTerm',
    }
  }
  var result = fuse.search(searchTerm)
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
}
