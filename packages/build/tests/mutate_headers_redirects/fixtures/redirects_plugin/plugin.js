import { writeFile } from 'fs'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

export default {
  async onPreBuild({ netlifyConfig: { redirects }, constants: { PUBLISH_DIR } }) {
    console.log(redirects)
    await pWriteFile(`${PUBLISH_DIR}/_redirects`, '/from /to')
  },
  onBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
