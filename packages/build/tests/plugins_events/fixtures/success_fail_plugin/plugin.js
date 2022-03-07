export const onBuild = function ({
  utils: {
    build: { failPlugin },
  },
}) {
  failPlugin('onBuild')
}

export const onSuccess = function () {
  console.log('onSuccess')
}
