export default {
  onPreBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'summary', text: 'text' })
  },
}
