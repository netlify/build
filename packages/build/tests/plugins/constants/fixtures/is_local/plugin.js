module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { IS_LOCAL } }) {
    console.log(IS_LOCAL)
  },
}
