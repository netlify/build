'use strict'

module.exports = {
  onPreBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    cancelBuild('test')
  },
}
