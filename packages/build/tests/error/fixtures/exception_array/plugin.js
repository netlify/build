module.exports = {
  onPreBuild() {
    throw [new Error('test'), new Error('testTwo')]
  },
}
