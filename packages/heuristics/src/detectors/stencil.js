const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

/**
 * detection logic - artificial intelligence!
 * */
module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json', 'stencil.config.ts'], projectDir)) return false
  // REQUIRED DEPS
  if (!hasRequiredDeps(['@stencil/core'], projectDir)) return false

  /** everything below now assumes that we are within stencil */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['start'],
    preferredCommand: 'stencil build --dev --watch --serve',
  })

  return {
    framework: 'stencil',
    language: 'js',
    command: getPackageManagerCommand(projectDir),
    port: 8888, // the port that the Netlify Dev User will use
    proxyPort: 3333, // the port that stencil normally outputs
    env: { ...process.env, BROWSER: 'none', PORT: 3000 },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, 'g'),
    dist: 'www',
  }
}
