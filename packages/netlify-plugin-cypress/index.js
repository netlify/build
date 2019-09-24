function netlifyCypressPlugin(conf) {
  return {
    // Hook into lifecycle
    postbuild: () => {
      console.log('running cypress integration tests')
    },
    manifest: () => {
      console.log('manifest thing netlifyCypressPlugin')
    }
  }
}

module.exports = netlifyCypressPlugin
