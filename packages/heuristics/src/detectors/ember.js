const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json'], projectDir)) return false
  if (!hasRequiredFiles(['ember-cli-build.js'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['ember-cli'], projectDir)) return false

  /** everything below now assumes that we are within ember */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['serve', 'start', 'run'],
    preferredCommand: 'ember serve',
  })

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(['ember', 'serve'])
  }

  return {
    framework: 'ember-cli',
    language: 'nodejs',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 4200,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${4200}(/)?`, 'g'),
    dist: 'dist',
  }
}
