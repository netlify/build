const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')
module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json', 'brunch-config.js'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['brunch'], projectDir)) return false

  /** everything below now assumes that we are within gatsby */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['start'],
    preferredCommand: 'brunch watch --server',
  })

  return {
    framework: 'brunch',
    language: 'nodejs',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 3333,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${3333}(/)?`, 'g'),
    dist: 'app/assets',
  }
}
