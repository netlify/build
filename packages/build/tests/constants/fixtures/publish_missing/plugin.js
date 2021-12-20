import pathExists from 'path-exists'

export default {
  async onPreBuild({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR, await pathExists(PUBLISH_DIR))
  },
}
