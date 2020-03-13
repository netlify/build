module.exports = {
  name: 'netlify-plugin-test',
  config: {
    properties: {
      test: { type: 'array' },
    },
  },
  onInit({ inputs: { test } }) {
    console.log(JSON.stringify(test))
  },
}
