'use strict'

module.exports = {
  onPreBuild({ netlifyConfig: { build } }) {
    // eslint-disable-next-line no-param-reassign
    build.command = 'node --version'
  },
  onBuild({
    netlifyConfig: {
      build: { command },
    },
  }) {
    console.log(command)
  },
}
