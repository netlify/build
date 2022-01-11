import { promises as fs } from 'fs'

export default {
  async onPreBuild({ netlifyConfig: { headers }, constants: { PUBLISH_DIR } }) {
    console.log(headers)
    await fs.writeFile(`${PUBLISH_DIR}/_headers`, '/path\n  test: one')
  },
  onBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
