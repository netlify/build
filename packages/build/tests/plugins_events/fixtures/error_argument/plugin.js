export const onBuild = function () {
  console.log('test')
  const error = new Error('test')
  error.name = 'TestError'
  throw error
}

export const onError = function ({ error: { name, message, stack } }) {
  console.log(name)
  console.log(message)
  console.log(stack)
}
