export const onPreBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show({ title: 'title ./two.js', summary: 'summary' })
}
