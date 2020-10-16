const STRING_LENGTH = 1e7

module.exports = {
  onPreBuild() {
    console.log('a'.repeat(STRING_LENGTH))
  },
}
