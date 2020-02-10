const gitUtils = require('@netlify/git-utils')
const cacheUtils = require('@netlify/cache-utils')
const runUtils = require('@netlify/run-utils')
const functionsUtils = require('@netlify/functions-utils')

// Some utilities need to perform some async initialization logic first.
// We do it once for all plugins in the parent process then pass it to the child
// processes.
const startUtils = async function(baseDir) {
  const git = await gitUtils({ cwd: baseDir })
  return { git }
}

// Retrieve the `utils` argument.
const getUtils = function({ utilsData: { git }, constants }) {
  const gitA = gitUtils.load(git)
  // eslint-disable-next-line no-unused-vars
  const functions = functionsUtils({ constants })
  return {
    git: gitA,
    cache: cacheUtils,
    run: runUtils,
    // TODO: enable once functions-utils is stable
    // functions,
  }
}

module.exports = { startUtils, getUtils }
