export const onEnd = function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  cancelBuild('test')
}
