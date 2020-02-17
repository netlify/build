const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  /* REQUIRED FILES */
  if (!hasRequiredFiles(['package.json'], projectDir)) return false
  /* REQUIRED DEPS */
  if (!(hasRequiredDeps(['parcel-bundler'], projectDir) || hasRequiredDeps(['parcel'], projectDir))) return false

  /* Everything below now assumes that we are within parcel */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['start', 'dev', 'run'],
    preferredCommand: 'parcel',
  })

  if (possibleArgsArrs.length === 0) {
    /* Offer to run it when the user doesnt have any scripts setup! 🤯 */
    possibleArgsArrs.push(['parcel'])
  }

  return {
    framework: 'parcel',
    language: 'nodejs',
    command: getPackageManagerCommand(projectDir),
    port: 8888,
    proxyPort: 1234,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${1234}(/)?`, 'g'),
    dist: 'dist',
  }
}
