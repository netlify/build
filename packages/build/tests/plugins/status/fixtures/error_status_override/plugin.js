module.exports = {
  onBuild() {
    throw new Error('onBuild')
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
