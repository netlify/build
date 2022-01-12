import pathExists from 'path-exists'

export const onPreBuild = async function ({ constants: { PUBLISH_DIR } }) {
  console.log(PUBLISH_DIR, await pathExists(PUBLISH_DIR))
}
