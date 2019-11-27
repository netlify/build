module.exports = {
  name: 'netlify-plugin-test',
  scopes: ['getSite'],
  async init({ api }) {
    await api.listSites('https://example.com')
  },
}
