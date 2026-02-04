import { env } from 'process'

export const onBuild = function () {
  console.log(env.NETLIFY_DB_URL)
}
