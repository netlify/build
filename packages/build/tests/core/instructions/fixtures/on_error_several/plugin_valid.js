module.exports = {
  name: 'netlify-plugin-valid',
  onError({ error: { message } }) {
    console.log(message)
  },
}
