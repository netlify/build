export const onPreBuild = function ({
  utils: {
    build: { failPlugin },
  },
}) {
  failPlugin('test')
  console.log('onPreBuild')
}

export const onBuild = function () {
  console.log('onBuild')
}
