module.exports = {
  name: 'netlify-plugin-test',
  init({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
  },
}
