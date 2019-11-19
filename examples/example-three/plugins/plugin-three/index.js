module.exports = function exampleOne() {
  return {
    name: 'netlify-plugin-one',
    outputs: {
      init: {
        zaz: 'string'
      }
    },
    init: () => {
      // Do stuff and return output
      return {
        zaz: 'nice'
      }
    },
  }
}
