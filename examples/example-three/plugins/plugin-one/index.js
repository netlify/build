module.exports = function exampleOne() {
  return {
    name: 'netlify-plugin-one',
    outputs: {
      // When output is returned
      init: {
        // Key that is returned
        foo: 'string',
      },
    },
    init: () => {
      console.log('this is the first thing run')
      return {
        foo: 'wow cool',
      }
    },
  }
}
