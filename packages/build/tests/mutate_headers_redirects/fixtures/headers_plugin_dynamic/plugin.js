import { writeFile } from 'fs'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

export default {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.publish = 'test'
  },
  async onBuild({ netlifyConfig: { headers }, constants: { PUBLISH_DIR } }) {
    console.log(headers)
    console.log(PUBLISH_DIR)
    await pWriteFile(`${PUBLISH_DIR}/_headers`, '/path\n  test: one')
  },
  onPostBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
