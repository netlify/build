module.exports = {
  name: 'netlify-plugin-invalid',
  onError() {
    console.log('Plugin invalid')
    throw new Error('Plugin invalid test')
  },
}
