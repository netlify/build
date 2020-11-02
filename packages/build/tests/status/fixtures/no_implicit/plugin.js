'use strict'

module.exports = {
  onBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'summary' })
  },
  onSuccess() {},
}
