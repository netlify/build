export const onBuild = function () {
  throw new Error('onBuild')
}

export const onError = function () {
  console.log('onError')
}

export const onEnd = function () {
  console.log('onEnd')
}
