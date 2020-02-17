const { hasRequiredFiles, getPackageManagerCommand, scanScripts } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  // REQUIRED FILES
  if (!hasRequiredFiles(['package.json', '.eleventy.js'], projectDir)) return false
  // commented this out because we're not sure if we want to require it
  // // REQUIRED DEPS
  // if (!hasRequiredDeps(["@11y/eleventy"])) return false;

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ['serve', 'dev'],
    preferredCommand: 'eleventy serve --watch',
  })

  return {
    framework: 'eleventy',
    language: 'js',
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    command: getPackageManagerCommand(projectDir),
    possibleArgsArrs: possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: '_site',
  }
}
