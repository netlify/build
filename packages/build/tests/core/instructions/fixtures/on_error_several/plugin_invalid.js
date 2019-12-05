module.exports = {
  name: 'netlify-plugin-invalid',
  error() {
    console.log('Plugin invalid')
    throw new Error('Plugin invalid test')
  },
}
