export const onPreBuild = function () {}

const throwError = function () {
  throw new Error('test')
}

throwError()
