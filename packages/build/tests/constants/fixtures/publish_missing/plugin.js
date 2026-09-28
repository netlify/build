import { existsSync } from 'fs'

export const onPreBuild = async function ({ constants: { PUBLISH_DIR } }) {
  console.log(PUBLISH_DIR, existsSync(PUBLISH_DIR))
}
