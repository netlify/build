export const onPreBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  const error = new Error('test')
  error.toJSON = () => ({})
  failBuild('message', { error })
}
