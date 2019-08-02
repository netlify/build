
function netlifySitemapPlugin(conf) {
  return {
    // Hook into lifecycle
    postbuild: () => {
      console.log('Build finished. Create sitemap from files')
    }
  }
}

module.exports = netlifySitemapPlugin
