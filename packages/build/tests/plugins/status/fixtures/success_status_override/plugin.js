module.exports = {
  onBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'onBuild' })
  },
  onSuccess({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'onSuccess' })
  },
}
