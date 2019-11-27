module.exports = {
  name: 'netlify-plugin-test',
  async init({ api: { listSites } }) {
    await listSites('https://example.com')
  },
}
