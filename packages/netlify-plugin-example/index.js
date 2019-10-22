module.exports = {
  name: '@netlify/plugin-example',
  scopes: ['listSites'],
  init({ api }) {
    console.log('init')
  },
  async finally({ api }) {
    if (api === undefined) {
      return
    }

    console.log('Finally... get site count')
    const sites = await api.listSites()
    if (sites) {
      console.log(`Site count! ${sites.length}`)
    }
  },
}
