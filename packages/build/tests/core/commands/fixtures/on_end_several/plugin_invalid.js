module.exports = {
  name: 'netlify-plugin-invalid',
  onEnd({ utils: { build } }) {
    console.log('Plugin invalid')
    build.fail('Plugin invalid test')
  },
}
