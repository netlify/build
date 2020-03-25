const { env } = require('process')

// Check if inside Netlify Build CI
const isNetlifyCI = function() {
  return Boolean(env.NETLIFY)
}

module.exports = isNetlifyCI
