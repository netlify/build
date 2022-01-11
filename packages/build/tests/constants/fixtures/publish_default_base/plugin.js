import { resolve } from 'path'

export const onPreBuild = function ({ constants: { PUBLISH_DIR } }) {
  console.log(PUBLISH_DIR, resolve(PUBLISH_DIR).endsWith('base'))
}
