import { writeFile } from 'fs'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

export default {
  async onPreBuild({ netlifyConfig: { headers }, constants: { PUBLISH_DIR } }) {
    console.log(headers)
    await pWriteFile(`${PUBLISH_DIR}/_headers`, '/path\n  test: one')
  },
  onBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
