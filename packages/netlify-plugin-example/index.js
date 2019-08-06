
function netlifySitemapPlugin(conf) {
  return {
    // Hook into lifecycle
    init: () => {
      console.log('init')
    },
    finally: () => {
      console.log('finally')
    }
  }
}

module.exports = netlifySitemapPlugin
