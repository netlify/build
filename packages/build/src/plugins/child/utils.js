const gitUtils = require('@netlify/git-utils')
const cacheUtils = require('@netlify/cache-utils')
const runUtils = require('@netlify/run-utils')
const functionsUtils = require('@netlify/functions-utils')

const { fail, cancel } = require('../error')

// Some utilities need to perform some async initialization logic first.
// We do it once for all plugins in the parent process then pass it to the child
// processes.
const startUtils = async function(buildDir) {
  const git = await gitUtils({ cwd: buildDir })
  return { git }
}

// Retrieve the `utils` argument.
const getUtils = function({ utilsData: { git }, constants }) {
  const buildUtils = { fail, cancel }
  const gitA = gitUtils.load(git)
  // eslint-disable-next-line no-unused-vars
  const functions = functionsUtils({ constants, fail })
  return {
    build: buildUtils,
    git: gitA,
    cache: cacheUtils,
    run: runUtils,
    // TODO: enable once functions-utils is stable
    // functions,
  }
}

module.exports = { startUtils, getUtils }
