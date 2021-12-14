'use strict'

module.exports = {
  onPreBuild({ netlifyConfig, constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR)
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.publish = 'test'
  },
  onBuild({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR)
  },
}
