
function netlifySitemapPlugin(conf) {
  return {
    scopes: ['listSites'],
    // Hook into lifecycle
    init: async ({ api }) => {
      console.log('init')
      const sits = await api.listSites()
      console.log(sits)
    },
    finally: () => {
      console.log('finally')
    }
  }
}

module.exports = netlifySitemapPlugin
