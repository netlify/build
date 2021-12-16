export default {
  onPreBuild({
    utils: {
      build: { failBuild },
    },
  }) {
    const error = new Error('test')
    error.toJSON = () => ({})
    failBuild('message', { error })
  },
}
