module.exports = {
  name: 'plugin-example',
  async onPostBuild({ utils: { functions } }) {
    await functions.add(`${__dirname}/test`)
  },
}
