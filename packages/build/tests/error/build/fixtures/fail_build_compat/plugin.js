module.exports = {
  async onPreBuild({
    utils: {
      build: { fail },
    },
  }) {
    fail('test')
  },
}
