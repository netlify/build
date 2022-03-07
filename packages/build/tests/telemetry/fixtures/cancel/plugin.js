export const onBuild = function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  cancelBuild('test')
}
