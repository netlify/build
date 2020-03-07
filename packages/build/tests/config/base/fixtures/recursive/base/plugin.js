module.exports = {
  name: 'netlify-plugin-test',
  onInit({
    netlifyConfig: {
      build: { base },
    },
  }) {
    console.log(base)
  },
}
