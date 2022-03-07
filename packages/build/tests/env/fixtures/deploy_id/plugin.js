import { env } from 'process'

export const onPreBuild = function () {
  console.log(env.DEPLOY_ID)
}
