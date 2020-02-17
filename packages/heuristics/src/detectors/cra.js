const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

/**
 * detection logic - artificial intelligence!
 * */
module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['react-scripts'], projectDir)) return false

  /** everything below now assumes that we are within create-react-app */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['start', 'serve', 'run'],
    preferredCommand: 'react-scripts start',
  })

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(['react-scripts', 'start'])
  }

  return {
    framework: 'create-react-app',
    language: 'nodejs',
    command: getPackageManagerCommand(projectDir),
    port: 8888, // the port that the Netlify Dev User will use
    proxyPort: 3000, // the port that create-react-app normally outputs
    env: { ...process.env, BROWSER: 'none', PORT: 3000 },
    stdio: ['inherit', 'pipe', 'pipe'],
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, 'g'),
    dist: 'public',
  }
}
