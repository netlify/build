const { hasRequiredFiles } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  if (!hasRequiredFiles(['config.rb'], projectDir)) return false

  return {
    framework: 'middleman',
    language: 'ruby:2.4',
    port: 8888,
    proxyPort: 4567,
    env: { ...process.env },
    command: 'bundle',
    possibleArgsArrs: [['exec', 'middleman', 'server']],
    urlRegexp: new RegExp(`(http://)([^:]+:)${4567}(/)?`, 'g'),
    dist: 'build',
  }
}
