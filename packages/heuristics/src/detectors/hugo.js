const { hasRequiredFiles } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  if (!hasRequiredFiles(['config.toml'], projectDir) && !hasRequiredFiles(['config.yaml'], projectDir)) return false

  return {
    framework: 'hugo',
    language: 'golang',
    port: 8888,
    proxyPort: 1313,
    env: { ...process.env },
    command: 'hugo',
    possibleArgsArrs: [['server', '-w']],
    urlRegexp: new RegExp(`(http://)([^:]+:)${1313}(/)?`, 'g'),
    dist: 'public',
  }
}
