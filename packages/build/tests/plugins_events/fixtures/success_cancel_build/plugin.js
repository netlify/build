export const onBuild = function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  cancelBuild('onBuild')
}

export const onSuccess = function () {
  console.log('onSuccess')
}
