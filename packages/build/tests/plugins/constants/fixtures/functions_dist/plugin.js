module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { FUNCTIONS_DIST } }) {
    console.log(FUNCTIONS_DIST)
  },
}
