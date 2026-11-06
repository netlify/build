export const onPostBuild = function ({ constants: { PUBLISH_DIR } }) {
  console.log(`PUBLISH_DIR=${PUBLISH_DIR}`)
}
