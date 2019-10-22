// Based on the configuration passed into the plugin,
// a dynamic lifecycle event is returned
module.exports = function dynamicPlugin(conf) {
  const hook = conf.hook || 'preBuild'
  return {
    name: 'netlify-plugin-dynamic-example',
    [`${hook}`]: () => {
      console.log('do the stuff')
    },
  }
}
