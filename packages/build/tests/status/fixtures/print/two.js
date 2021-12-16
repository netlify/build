export default {
  onPreBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ title: 'title ./two.js', summary: 'summary' })
  },
}
