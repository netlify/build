module.exports = {
  name: 'netlify-plugin-test',
  onInit({ inputs: { one } }) {
    console.log(one)
  },
}
