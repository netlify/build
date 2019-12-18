module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { run } }) {
    await run('echo', {})
  },
}
