class TestError extends Error {
  constructor(...args) {
    super(...args)
    this.name = 'TestError'
  }
}

module.exports = {
  name: 'netlify-plugin-test',
  onBuild() {
    console.log('test')
    throw new TestError('test')
  },
  onError({ error: { name, message, stack } }) {
    console.log(name)
    console.log(message)
    console.log(stack)
  },
}
