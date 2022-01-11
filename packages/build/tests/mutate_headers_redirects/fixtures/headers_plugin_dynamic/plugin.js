import { promises as fs } from 'fs'

export default {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.publish = 'test'
  },
  async onBuild({ netlifyConfig: { headers }, constants: { PUBLISH_DIR } }) {
    console.log(headers)
    console.log(PUBLISH_DIR)
    await fs.writeFile(`${PUBLISH_DIR}/_headers`, '/path\n  test: one')
  },
  onPostBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
