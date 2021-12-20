export default {
  onPreBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ title: 'title', summary: 'summary', text: 'text' })
  },
}
