const getError = function () {
  return new Error('innerTest')
}

export default {
  onPreBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    const error = getError()
    cancelBuild('test', { error })
  },
}
