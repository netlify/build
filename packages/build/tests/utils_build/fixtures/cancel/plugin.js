export const onPreBuild = function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  cancelBuild('test')
}
