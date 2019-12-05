module.exports = {
  name: '@netlify/plugin-example',
  init: () => {
    console.log('init')
  },
  end: () => {
    console.log('build done')
  },
}
