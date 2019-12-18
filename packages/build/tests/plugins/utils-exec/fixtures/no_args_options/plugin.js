module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { exec } }) {
    await exec('echo', {})
  },
}
