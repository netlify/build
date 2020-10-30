'use strict'

module.exports = {
  onBuild() {
    throw new Error('onBuild')
  },
  onSuccess({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'summary' })
  },
  onError({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'summary' })
  },
  onEnd({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'summary' })
  },
}
