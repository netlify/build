import { promises as fs } from 'fs'

export default {
  async onPreBuild({ netlifyConfig: { redirects }, constants: { PUBLISH_DIR } }) {
    console.log(redirects)
    await fs.writeFile(`${PUBLISH_DIR}/_redirects`, '/from /to')
  },
  onBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
