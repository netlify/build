function netlifySitemapPlugin(conf) {
  return {
    scopes: ['listSites'],
    // Hook into lifecycle
    init: ({ api }) => {
      console.log('init')
    },
    finally: async ({ api }) => {
      if (api === undefined) {
        return
      }

      console.log('Finally... get site count')
      const sites = await api.listSites()
      if (sites) {
        console.log(`Site count! ${sites.length}`)
      }
    }
  }
}

module.exports = netlifySitemapPlugin
