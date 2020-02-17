const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['@quasar/app'], projectDir)) return false

  /** everything below now assumes that we are within Quasar */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['serve', 'start', 'run', 'dev'],
    // NOTE: this is comented out as it was picking this up in cordova related scripts.
    // preferredCommand: "quasar dev"
  })

  if (possibleArgsArrs.length === 0) {
    // ofer to run this default when the user doesnt have any matching scripts setup!
    possibleArgsArrs.push(['quasar', 'dev'])
  }

  return {
    framework: 'quasar-cli',
    language: 'nodejs',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: '.quasar',
  }
}
