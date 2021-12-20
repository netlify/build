const getError = function () {
  return new Error('innerTest')
}

export default {
  onPreBuild({
    utils: {
      build: { failBuild },
    },
  }) {
    const error = getError()
    failBuild('test', { error })
  },
}
