'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.services = { identity: 'two' }
  },
  onBuild({
    netlifyConfig: {
      build: { services },
    },
  }) {
    console.log(services)
  },
}
