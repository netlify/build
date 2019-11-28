module.exports = {
  name: '@netlify/plugin-example',
  init: () => {
    console.log('init')
  },
  onEnd: () => {
    console.log('build done')
  },
}
