const STRING_LENGTH = 1e3

module.exports = {
  onPreBuild() {
    console.log('a'.repeat(STRING_LENGTH))
    console.error('b'.repeat(STRING_LENGTH))
  },
  onBuild() {
    console.log('c'.repeat(STRING_LENGTH))
    console.error('d'.repeat(STRING_LENGTH))
  },
}
