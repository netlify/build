module.exports = {
  name: 'netlify-plugin-test',
  inputs: {
    properties: {
      test: { default: 'test' },
    },
  },
  onInit({ inputs: { test } }) {
    console.log(test)
  },
}
