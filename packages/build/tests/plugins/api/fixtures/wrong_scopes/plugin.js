module.exports = {
  async onPreBuild({ api }) {
    await api.listSites('https://example.com')
  },
}
