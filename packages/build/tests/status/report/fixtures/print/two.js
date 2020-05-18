module.exports = {
  onInit({
    utils: {
      status: { show },
    },
  }) {
    show({ title: 'title ./two.js', summary: 'summary' })
  },
}
