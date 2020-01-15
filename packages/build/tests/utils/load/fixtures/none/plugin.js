module.exports = {
  name: 'netlify-plugin-test',
  onInit({ utils }) {
    console.log(Object.keys(utils))
  },
}
