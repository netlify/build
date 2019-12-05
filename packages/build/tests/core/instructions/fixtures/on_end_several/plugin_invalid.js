module.exports = {
  name: 'netlify-plugin-invalid',
  end() {
    console.log('Plugin invalid')
    throw new Error('Plugin invalid test')
  },
}
