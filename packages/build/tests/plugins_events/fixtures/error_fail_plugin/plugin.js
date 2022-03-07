export const onBuild = function ({
  utils: {
    build: { failPlugin },
  },
}) {
  failPlugin('onBuild')
}

export const onError = function () {
  console.log('onError')
}
