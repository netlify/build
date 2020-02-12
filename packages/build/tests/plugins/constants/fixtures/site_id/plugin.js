module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { SITE_ID } }) {
    console.log(SITE_ID)
  },
}
