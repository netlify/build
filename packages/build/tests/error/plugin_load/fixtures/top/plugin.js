module.exports = {
  name: 'netlify-plugin-test',
}

const throwError = function() {
  throw new Error('test')
}

throwError()
