const { hasRequiredDeps, hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = async function(projectDir) {
  /* REQUIRED FILES */
  if (!hasRequiredFiles(['package.json'], projectDir)) return false

  /* REQUIRED DEPS */
  if (!(hasRequiredDeps(['netlify-lambda'], projectDir) || hasRequiredDeps(['netlify-lambda'], projectDir))) return false

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['build'],
    preferredCommand: 'netlify-lambda',
  })

  return {
    language: 'js',
    command: getPackageManagerCommand(projectDir),
    possibleArgsArrs,
    env: { ...process.env },
    dist: 'build',
  }
}
