export default {
  onPreBuild() {
    // eslint-disable-next-line no-throw-literal
    throw [new Error('test'), new Error('testTwo')]
  },
}
