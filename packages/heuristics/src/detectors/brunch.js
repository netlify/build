const { hasRequiredDeps, hasRequiredFiles, yarnOrNPMCommand, scanScripts } = require('./utils/jsdetect')
module.exports = function() {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json', 'brunch-config.js'])) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['brunch'])) return false

  /** everything below now assumes that we are within gatsby */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['start'],
    preferredCommand: 'brunch watch --server',
  })

  return {
    type: 'brunch',
    command: yarnOrNPMCommand,
    port: 8888,
    proxyPort: 3333,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${3333}(/)?`, 'g'),
    dist: 'app/assets',
  }
}
