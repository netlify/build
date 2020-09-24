const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  onPreBuild({
    utils: {
      build: { cancelBuild },
    },
  }) {
    const error = getError()
    cancelBuild('test', { error })
  },
}
