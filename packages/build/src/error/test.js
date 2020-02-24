const {
  env: { NETLIFY_BUILD_TEST_UNCAUGHT },
} = require('process')

// In integration tests, throw an error to test how bugs are reported.
// TODO: find a way that does not require hooking into live code like this
const testUncaught = function() {
  if (NETLIFY_BUILD_TEST_UNCAUGHT === 'simple') {
    throw new Error('test')
  }

  if (NETLIFY_BUILD_TEST_UNCAUGHT === 'props') {
    const error = new Error('test')
    error.test = true
    throw error
  }
}

module.exports = { testUncaught }
