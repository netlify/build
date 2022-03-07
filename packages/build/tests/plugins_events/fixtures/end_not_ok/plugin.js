export const onBuild = function () {
  throw new Error('onBuild')
}

export const onEnd = function () {
  console.log('onEnd')
}
