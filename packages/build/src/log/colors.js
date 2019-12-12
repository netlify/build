const {
  env,
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  stdout: { isTTY, getColorDepth },
} = require('process')
const {
  inspect: { defaultOptions },
} = require('util')

const isNetlifyCI = require('../utils/is-netlify-ci')

// Set the amount of colors to use by `chalk` (and underlying `supports-color`)
// 0 is no colors, 1 is 16 colors, 2 is 256 colors, 3 is 16 million colors.
const setColorLevel = function() {
  env.FORCE_COLOR = getColorLevel()
  defaultOptions.colors = hasColors()
}

const getColorLevel = function() {
  // Allow user overridding this logic
  if (env.FORCE_COLOR) {
    return env.FORCE_COLOR
  }

  // In unit tests when using `PRINT` mode
  // istanbul ignore next
  if (env.PRINT === '1') {
    return '1'
  }

  // This also ensure colors are used in the BuildBot
  if (isNetlifyCI()) {
    return '1'
  }

  // If the output is not a console (e.g. redirected to `less` or to a file),
  // we disable colors because ANSI sequences are a problem most of the time in
  // that case
  // We cannot test this since unit tests are never in an interactive terminal
  // istanbul ignore else
  if (!isTTY) {
    return '0'
  }

  // Node <9.9.0 does not have `getColorDepth()`. Default to 16 colors then.
  // istanbul ignore next
  if (getColorDepth === undefined) {
    return '1'
  }

  // Guess how many colors are supported, mostly based on environment variables
  // This allows using 256 colors or 16 million colors on terminals that
  // support it
  // istanbul ignore next
  return DEPTH_TO_LEVEL[getColorDepth()]
}

const DEPTH_TO_LEVEL = { 1: '0', 4: '1', 8: '2', 24: '3' }

const hasColors = function() {
  return env.FORCE_COLOR !== '0' && env.FORCE_COLOR !== 'false'
}

module.exports = { setColorLevel, hasColors }
