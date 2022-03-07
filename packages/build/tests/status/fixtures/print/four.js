export const onPreBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show({ title: 'title', summary: 'summary', text: 'text' })
}
