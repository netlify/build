import { promisify } from 'util'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

export const onPreBuild = async function () {
  unhandledPromise()
  console.log('onPreBuild')
  await pSetTimeout(0)
}

const unhandledPromise = function () {
  return Promise.reject(new Error('test'))
}
