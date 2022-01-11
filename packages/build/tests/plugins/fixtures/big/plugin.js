const STRING_LENGTH = 1e7

export const onPreBuild = function () {
  console.log('a'.repeat(STRING_LENGTH))
}
