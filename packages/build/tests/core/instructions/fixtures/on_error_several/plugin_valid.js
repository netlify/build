module.exports = {
  name: 'netlify-plugin-valid',
  error({ error: { message } }) {
    console.log(message)
  },
}
