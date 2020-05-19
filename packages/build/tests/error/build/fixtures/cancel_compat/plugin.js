module.exports = {
  async onPreBuild({
    utils: {
      build: { cancel },
    },
  }) {
    cancel('test')
  },
}
