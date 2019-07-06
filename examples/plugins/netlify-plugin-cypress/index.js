

module.exports = function netlifyCypressPlugin(conf) {
  return {
    // Hook into lifecycle
    init: ({ config, cancel, utils }) => {
      console.log('init thing netlifyCypressPlugin ')
    },
    build: () => {
      console.log('build thing netlifyCypressPlugin')
    },
    manifest: () => {
      console.log('manifest thing netlifyCypressPlugin')
    }
  }
}
