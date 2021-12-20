export default {
  onBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'summary' })
  },
  onSuccess() {},
}
