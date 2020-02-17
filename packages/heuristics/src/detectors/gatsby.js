const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')
module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json', 'gatsby-config.js'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['gatsby'], projectDir)) return false

  /** everything below now assumes that we are within gatsby */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['start', 'develop', 'dev'],
    preferredCommand: 'gatsby develop',
  })

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(['gatsby', 'develop'])
  }
  return {
    framework: 'gatsby',
    language: 'js',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 8000,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8000}(/)?`, 'g'),
    dist: 'public',
  }
}
