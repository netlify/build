const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['vuepress'], projectDir)) return false

  /** everything below now assumes that we are within vue */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['docs:dev', 'dev', 'run'],
    preferredCommand: 'vuepress dev',
  })

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(['vuepress', 'dev'])
  }

  return {
    framework: 'vuepress',
    language: 'js',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: '.vuepress/dist',
  }
}
