module.exports = {
  name: '@netlify/plugin-example',
  onInit: () => {
    console.log('onInit')
  },
  onEnd: () => {
    console.log('onBuild')
  },
}
