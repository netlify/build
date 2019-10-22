module.exports = function exampleOne(conf) {
  return {
    name: 'netlify-plugin-one',
    init: () => {
      console.log('this is the first thing run')
    },
  }
}
