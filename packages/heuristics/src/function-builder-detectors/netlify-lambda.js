const { hasRequiredDeps, hasRequiredFiles, packageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = async function() {
  /* REQUIRED FILES */
  if (!hasRequiredFiles(['package.json'])) return false

  /* REQUIRED DEPS */
  if (!(hasRequiredDeps(['netlify-lambda']) || hasRequiredDeps(['netlify-lambda']))) return false

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['build'],
    preferredCommand: 'netlify-lambda',
  })

  return {
    language: 'js',
    command: packageManagerCommand,
    possibleArgsArrs,
    env: { ...process.env },
    dist: 'build',
  }
}
