const { hasRequiredDeps, hasRequiredFiles, packageManagerCommand, scanScripts } = require('./utils/jsdetect')
module.exports = function() {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json', 'gatsby-config.js'])) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['gatsby'])) return false

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
    language: 'nodejs',
    command: packageManagerCommand,
    port: 8888,
    proxyPort: 8000,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8000}(/)?`, 'g'),
    dist: 'public',
  }
}
