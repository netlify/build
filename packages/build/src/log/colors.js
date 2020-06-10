const { env } = require('process')
const {
  inspect: { defaultOptions },
} = require('util')

// Ensure colors are used in the buildbot.
// For `chalk`, underlying `supports-color` and `console.log()`.
const setColorLevel = function() {
  // We cannot use the --mode CLI flag since this must be loaded before `chalk`.
  if (!env.NETLIFY && env.PARENT_HAS_COLOR !== '1') {
    return
  }

  env.FORCE_COLOR = '1'
  defaultOptions.colors = true
}

// Plugin child processes use `stdio: 'pipe'` so they are always
// non-interactive even if the parent is an interactive TTY. This means they
// would normally lose colors. If the parent has colors, we pass an environment
// variable to the child process to force colors.
const getParentColorEnv = function() {
  // This must be required after `env.FORCE_COLOR` has been set because it
  // checks it at require-time.
  const supportsColor = require('supports-color')

  if (supportsColor.stdout === false) {
    return {}
  }

  return { PARENT_HAS_COLOR: '1' }
}

module.exports = { setColorLevel, getParentColorEnv }
