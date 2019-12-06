module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ api: { listSites } }) {
    await listSites('https://example.com')
  },
}
