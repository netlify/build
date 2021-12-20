const STRING_LENGTH = 1e7

export default {
  onPreBuild() {
    console.log('a'.repeat(STRING_LENGTH))
  },
}
