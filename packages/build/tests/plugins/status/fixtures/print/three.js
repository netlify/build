module.exports = {
  onInit({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: 'summary', text: 'text' })
  },
}
