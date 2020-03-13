module.exports = {
  name: 'netlify-plugin-test',
  config: {
    properties: {
      test: { default: 'test' },
    },
  },
  onInit({ inputs: { test } }) {
    console.log(test)
  },
}
