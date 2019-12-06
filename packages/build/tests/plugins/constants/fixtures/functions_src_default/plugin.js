module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
  },
}
