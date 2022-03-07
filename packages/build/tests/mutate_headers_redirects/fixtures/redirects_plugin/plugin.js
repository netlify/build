import { promises as fs } from 'fs'

export const onPreBuild = async function ({ netlifyConfig: { redirects }, constants: { PUBLISH_DIR } }) {
  console.log(redirects)
  await fs.writeFile(`${PUBLISH_DIR}/_redirects`, '/from /to')
}

export const onBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}
