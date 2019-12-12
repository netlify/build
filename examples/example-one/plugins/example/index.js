// Export plugin
module.exports = function netlifyPlugin() {
  return {
    name: 'netlify-plugin-one',
    onInit: () => {
      console.log('Hi from onInit')
    },
    onGetCache: () => {
      console.log('Hi from onGetCache')
    },
    onInstall: () => {
      console.log('Hi from onInstall')
    },
    onPreBuild: () => {
      console.log('Hi from onPreBuild')
    },
    onBuild: () => {
      console.log('Hi from onBuild')
    },
    onPostBuild: () => {
      console.log('Hi from onPostBuild')
    },
    onPreDeploy: () => {
      console.log('Hi from onPreDeploy')
    },
    onSaveCache: () => {
      console.log('Hi from onSaveCache')
    },
    onEnd: () => {
      console.log('Hi from onEnd')
    },
  }
}
