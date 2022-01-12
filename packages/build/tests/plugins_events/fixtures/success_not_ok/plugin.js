export const onBuild = function () {
  throw new Error('onBuild')
}

export const onSuccess = function () {
  console.log('onSuccess')
}
