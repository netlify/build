'use strict'

module.exports = {
  onEnd({
    utils: {
      build: { failBuild },
    },
  }) {
    failBuild('test')
  },
}
