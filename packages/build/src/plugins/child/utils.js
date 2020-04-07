const cacheUtils = require('@netlify/cache-utils')
const functionsUtils = require('@netlify/functions-utils')
const gitUtils = require('@netlify/git-utils')
const runUtils = require('@netlify/run-utils')

const { failBuild, failPlugin, cancelBuild } = require('../error')

// Some utilities need to perform some async initialization logic first.
// We do it once for all plugins in the parent process then pass it to the child
// processes.
const startUtils = async function(buildDir) {
  const git = await gitUtils({ cwd: buildDir })
  return { git }
}

// Retrieve the `utils` argument.
const getUtils = function({ utilsData: { git }, constants: { FUNCTIONS_SRC, CACHE_DIR } }) {
  const buildUtils = { failBuild, failPlugin, cancelBuild }
  const gitA = gitUtils.load(git)
  const cache = cacheUtils.bindOpts({ cacheDir: CACHE_DIR })
  const add = src => functionsUtils.add(src, FUNCTIONS_SRC, { fail: failBuild })
  const functions = { add }
  const utils = {
    build: buildUtils,
    git: gitA,
    cache,
    run: runUtils,
    functions,
  }

  // Older names, kept for backward compatibility. Non-enumerable.
  // TODO: remove after beta is done
  Object.defineProperty(utils.build, 'fail', { value: utils.build.failBuild })
  Object.defineProperty(utils.build, 'cancel', { value: utils.build.cancelBuild })

  return utils
}

module.exports = { startUtils, getUtils }
