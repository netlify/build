import { promises as fs } from 'fs'

export const onPreBuild = async function ({ netlifyConfig: { headers }, constants: { PUBLISH_DIR } }) {
  console.log(headers)
  await fs.writeFile(`${PUBLISH_DIR}/_headers`, '/path\n  test: one')
}

export const onBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
