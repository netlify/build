module.exports = {
  name: 'netlify-plugin-test',
  onInit({ utils: { git } }) {
    console.log(git)
  },
}
