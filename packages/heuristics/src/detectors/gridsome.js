const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')
module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json', 'gridsome.config.js'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['gridsome'], projectDir)) return false

  /** everything below now assumes that we are within gridsome */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['develop'],
    preferredCommand: 'gridsome develop',
  })

  return {
    framework: 'gridsome',
    language: 'js',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: 'static',
  }
}
