module.exports = {
  name: 'netlify-plugin-test',
  scopes: ['getSite'],
  async onInit({ api }) {
    await api.listSites('https://example.com')
  },
}
