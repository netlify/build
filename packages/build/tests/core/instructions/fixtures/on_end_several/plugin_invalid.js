module.exports = {
  name: 'netlify-plugin-invalid',
  onEnd() {
    console.log('Plugin invalid')
    throw new Error('Plugin invalid test')
  },
}
