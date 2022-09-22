import { promises as fs } from 'fs'

export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.build.publish = 'test'
}

export const onBuild = async function ({ netlifyConfig: { headers }, constants: { PUBLISH_DIR } }) {
  console.log(headers)
  console.log(PUBLISH_DIR)
  await fs.writeFile(`${PUBLISH_DIR}/_headers`, '/path\n  test: one')
}

export const onPostBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
