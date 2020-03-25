module.exports = {
  async onPreBuild({
    utils: {
      functions: { add },
    },
  }) {
    await add(`${__dirname}/test`)
  },
}
