module.exports = {
  name: 'netlify-plugin-example',
  onInit({ utils: { build } }) {
    build.fail('test')
  },
}
