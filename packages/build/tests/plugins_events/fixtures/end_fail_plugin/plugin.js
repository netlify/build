export const onBuild = function ({
  utils: {
    build: { failPlugin },
  },
}) {
  failPlugin('onBuild')
}

export const onEnd = function () {
  console.log('onEnd')
}
