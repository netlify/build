export const onPreBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: 'summary', text: 'text' })
}
