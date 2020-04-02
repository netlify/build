const {
  env: { NETLIFY_BUILD_TEST_CLI },
} = require('process')

// Check if inside Netlify CLI
const isNetlifyCli = function() {
  if (NETLIFY_BUILD_TEST_CLI) {
    return true
  }

  const { stack } = new Error('')
  return stack.includes('/netlify-cli/')
}

module.exports = { isNetlifyCli }
