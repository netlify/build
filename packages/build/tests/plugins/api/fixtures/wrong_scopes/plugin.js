module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ api }) {
    await api.listSites('https://example.com')
  },
}
