export const onBuild = function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  cancelBuild('onBuild')
}

export const onEnd = function () {
  console.log('onEnd')
}
