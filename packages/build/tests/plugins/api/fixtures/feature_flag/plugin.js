module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ api }) {
    console.log(api === undefined)
  },
}
