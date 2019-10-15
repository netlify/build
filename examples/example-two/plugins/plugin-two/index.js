
module.exports = function pluginTwo() {
  return {
    init: () => {
      console.log('this is the first thing run')
    },
    build: () => {
      console.log('this is run during site build')
    },
    postBuild: () => {
      console.log('this is run after site build')
    },
  }
}
