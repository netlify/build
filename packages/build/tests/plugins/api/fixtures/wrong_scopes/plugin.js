module.exports = {
  async onInit({ api }) {
    await api.listSites('https://example.com')
  },
}
