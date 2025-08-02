import { setTimeout } from 'timers/promises'

export const onPreBuild = async function () {
  unhandledPromise()
  console.log('onPreBuild')
  await setTimeout(0)
}

const unhandledPromise = function () {
  return Promise.reject(new Error('test'))
}
