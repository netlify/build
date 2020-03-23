const gitUtils = require('@netlify/git-utils')
const cacheUtils = require('@netlify/cache-utils')
const runUtils = require('@netlify/run-utils')
const functionsUtils = require('@netlify/functions-utils')

const { failBuild, failPlugin, cancelBuild } = require('../error')

// Some utilities need to perform some async initialization logic first.
// We do it once for all plugins in the parent process then pass it to the child
// processes.
const startUtils = async function (buildDir) {
  const git = await gitUtils({ cwd: buildDir })
  return { git }
}

// Retrieve the `utils` argument.
const getUtils = function ({ utilsData: { git }, constants }) {
  const buildUtils = { failBuild, failPlugin, cancelBuild }
  const gitA = gitUtils.load(git)
  // eslint-disable-next-line no-unused-vars
  const functions = functionsUtils({ constants, failBuild })
  const utils = {
    build: buildUtils,
    git: gitA,
    cache: cacheUtils,
    run: runUtils,
    // TODO: enable once functions-utils is stable
    // functions,
  }

  // Older names, kept for backward compatibility. Non-enumerable.
  // TODO: remove after beta is done
  Object.defineProperty(utils.build, 'fail', { value: utils.build.failBuild })
  Object.defineProperty(utils.build, 'cancel', { value: utils.build.cancelBuild })

  return utils
}

module.exports = { startUtils, getUtils }
