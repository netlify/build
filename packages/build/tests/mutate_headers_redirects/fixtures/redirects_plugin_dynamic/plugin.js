import { promises as fs } from 'fs'

export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.build.publish = 'test'
}

export const onBuild = async function ({ netlifyConfig: { redirects }, constants: { PUBLISH_DIR } }) {
  console.log(redirects)
  console.log(PUBLISH_DIR)
  await fs.writeFile(`${PUBLISH_DIR}/_redirects`, '/from /to')
}

export const onPostBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}
