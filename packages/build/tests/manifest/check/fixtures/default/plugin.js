module.exports = {
  name: 'netlify-plugin-test',
  onInit({ inputs: { test } }) {
    console.log(test)
  },
}
