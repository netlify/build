import { resolve } from 'path'

export default {
  onPreBuild({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR, resolve(PUBLISH_DIR).endsWith('base'))
  },
}
