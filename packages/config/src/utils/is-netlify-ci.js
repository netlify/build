const {
  env: { NETLIFY },
} = require('process')

// Check if inside Netlify Build CI
const isNetlifyCI = function() {
  return Boolean(NETLIFY)
}

module.exports = isNetlifyCI
