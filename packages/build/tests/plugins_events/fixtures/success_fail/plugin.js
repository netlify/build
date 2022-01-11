export const onBuild = function () {
  console.log('onBuild')
}

export const onSuccess = function () {
  throw new Error('onSuccess')
}
