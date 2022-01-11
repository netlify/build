export const onBuild = function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  cancelBuild('onBuild')
}

export const onError = function () {
  console.log('onError')
}
