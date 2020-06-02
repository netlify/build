module.exports = {
  async onPreBuild() {
    const error = new Error('test')
    error.self = error
    error.test = true
    error.nullProp = null
    error.objectProp = {}
    throw error
  },
}
