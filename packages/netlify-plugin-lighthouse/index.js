
function netlifyLighthousePlugin(conf) {
  return {
    // Hook into lifecycle
    postdeploy: () => {
      console.log('Deploy finished.')
      console.log('Score site with lighthouse and save results')
    }
  }
}

module.exports = netlifyLighthousePlugin
