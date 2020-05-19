module.exports = {
  onPreBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'summary' })
  },
}
