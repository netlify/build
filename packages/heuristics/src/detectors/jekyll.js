const { hasRequiredFiles } = require('../utils/jsdetect')

module.exports = function(projectDir) {
  if (!hasRequiredFiles(['_config.yml'], projectDir)) return false

  return {
    framework: 'jekyll',
    language: 'ruby:2.4',
    port: 8888,
    proxyPort: 4000,
    env: { ...process.env },
    command: 'bundle',
    possibleArgsArrs: [['exec', 'jekyll', 'serve', '-w']],
    urlRegexp: new RegExp(`(http://)([^:]+:)${4000}(/)?`, 'g'),
    dist: '_site',
  }
}
