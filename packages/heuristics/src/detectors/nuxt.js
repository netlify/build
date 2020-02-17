const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['nuxt'], projectDir)) return false

  /** everything below now assumes that we are within vue */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['start', 'dev', 'run'],
    preferredCommand: 'nuxt start',
  })

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(['nuxt', 'start'])
  }

  return {
    framework: 'yarn',
    language: 'js',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 3000,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, 'g'),
    dist: '.nuxt',
  }
}
