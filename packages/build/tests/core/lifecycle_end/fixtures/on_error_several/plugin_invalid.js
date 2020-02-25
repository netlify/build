module.exports = {
  name: 'netlify-plugin-invalid',
  onError({ utils: { build } }) {
    console.log('Plugin invalid')
    build.fail('Plugin invalid test')
  },
}
