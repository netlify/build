const {
  env: { DEPLOY_PRIME_URL },
} = require('process')

// Check if inside Netlify Build CI
const isNetlifyCI = function() {
  return Boolean(DEPLOY_PRIME_URL)
}

module.exports = { isNetlifyCI }
