const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json', '_config.yml'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['hexo'], projectDir)) return false

  /** everything below now assumes that we are within gatsby */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['start', 'dev', 'develop'],
    preferredCommand: 'hexo server',
  })

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(['hexo', 'server'])
  }
  return {
    framework: 'hexo',
    language: 'nodejs',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 4000,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${4000}(/)?`, 'g'),
    dist: 'public',
  }
}
