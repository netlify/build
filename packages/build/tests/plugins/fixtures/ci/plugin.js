const STRING_LENGTH = 1e3

export const onPreBuild = function () {
  console.log('a'.repeat(STRING_LENGTH))
  console.error('b'.repeat(STRING_LENGTH))
}

export const onBuild = function () {
  console.log('c'.repeat(STRING_LENGTH))
  console.error('d'.repeat(STRING_LENGTH))
}
