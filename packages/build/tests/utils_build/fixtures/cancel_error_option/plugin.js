const getError = function () {
  return new Error('innerTest')
}

export const onPreBuild = function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  const error = getError()
  cancelBuild('test', { error })
}
