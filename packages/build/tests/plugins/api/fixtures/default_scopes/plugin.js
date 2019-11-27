module.exports = {
  name: 'netlify-plugin-test',
  async init({ api }) {
    await api.listSites('https://example.com')
  },
}
