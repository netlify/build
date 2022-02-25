const getError = function () {
  return new Error('innerTest')
}

export const onPreBuild = function ({
  utils: {
    build: { failPlugin },
  },
}) {
  const error = getError()
  failPlugin('test', { error })
  console.log('onPreBuild')
}

export const onBuild = function () {
  console.log('onBuild')
}
