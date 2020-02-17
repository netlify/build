const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['@vue/cli-service'], projectDir)) return false

  /** everything below now assumes that we are within vue */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['serve', 'start', 'run'],
    preferredCommand: 'vue-cli-service serve',
  })

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(['vue-cli-service', 'serve'])
  }

  return {
    framework: 'vue-cli',
    language: 'nodejs',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: 'dist',
  }
}
