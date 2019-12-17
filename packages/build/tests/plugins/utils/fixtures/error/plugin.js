module.exports = {
  name: 'netlify-plugin-test',
  onInit({ utils: { test } }) {
    console.log(test)
  },
}
