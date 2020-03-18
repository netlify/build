module.exports = {
  async onInit({ api: { listSites } }) {
    await listSites('https://example.com')
  },
}
