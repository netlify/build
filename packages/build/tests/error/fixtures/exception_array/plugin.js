module.exports = {
  async onPreBuild() {
    throw [new Error('test'), new Error('testTwo')]
  },
}
