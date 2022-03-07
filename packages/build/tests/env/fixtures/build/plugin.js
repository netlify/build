import { env } from 'process'

export const onPreBuild = function () {
  console.log(env.TEST)
}
