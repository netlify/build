const getError = function() {
  return new Error('innerTest')
}

module.exports = {
  onPreBuild({
    utils: {
      build: { failBuild },
    },
  }) {
    const error = getError()
    failBuild('test', { error })
  },
}
