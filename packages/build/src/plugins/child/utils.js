const gitUtils = require('@netlify/git-utils')
const cacheUtils = require('@netlify/cache-utils')
const runUtils = require('@netlify/run-utils')
const functionsUtils = require('@netlify/functions-utils')

// Retrieve the `utils` argument.
const getUtils = async function({ constants }) {
  const git = await gitUtils()
  const functions = functionsUtils({ constants })
  return { git, cache: cacheUtils, run: runUtils, functions }
}

module.exports = { getUtils }
