module.exports = {
  name: '@netlify/plugin-example',
  init: () => {
    console.log('init')
  },
  finally: () => {
    console.log('build done')
  },
}
