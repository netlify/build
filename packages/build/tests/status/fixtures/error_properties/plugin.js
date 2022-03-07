export const onBuild = function () {
  const error = new Error('test')
  error.test = true
  throw error
}
