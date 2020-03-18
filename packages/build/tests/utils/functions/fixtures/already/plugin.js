module.exports = {
  async onPostBuild({ utils: { functions } }) {
    await functions.add(`${__dirname}/test.js`)
  },
}
