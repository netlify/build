const getError = function () {
  return new Error('innerTest')
}

export const onPreBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  const error = getError()
  failBuild('test', { error })
}
