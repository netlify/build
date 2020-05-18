module.exports = {
  onInit({
    utils: {
      status: { show },
    },
  }) {
    show({ title: 'title', summary: 'summary', text: 'text' })
  },
}
