// Export plugin
module.exports = function netlifyPlugin() {
  return {
    name: 'netlify-plugin-one',
    init: () => {
      console.log('Hi from init')
    },
    getCache: () => {
      console.log('Hi from getCache')
    },
    install: () => {
      console.log('Hi from install')
    },
    preBuild: () => {
      console.log('Hi from preBuild')
    },
    build: () => {
      console.log('Hi from build')
    },
    postBuild: () => {
      console.log('Hi from postBuild')
    },
    package: () => {
      console.log('Hi from package')
    },
    preDeploy: () => {
      console.log('Hi from preDeploy')
    },
    saveCache: () => {
      console.log('Hi from saveCache')
    },
    finally: () => {
      console.log('Hi from finally')
    },
  }
}
