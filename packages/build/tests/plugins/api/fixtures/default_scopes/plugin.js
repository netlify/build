module.exports = {
  async onPreBuild({ api: { listSites } }) {
    await listSites('https://example.com')
  },
}
