module.exports = {
  name: 'netlify-plugin-test',
  onInit({ utils: { git } }) {
    console.log(Object.keys(git))
  },
}
