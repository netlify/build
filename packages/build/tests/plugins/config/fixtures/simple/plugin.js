module.exports = {
  name: 'netlify-plugin-test',
  onInit({ inputs: { foo } }) {
    console.log(foo)
  },
}
