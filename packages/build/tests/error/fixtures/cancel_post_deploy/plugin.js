'use strict'

module.exports = {
  onEnd({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
