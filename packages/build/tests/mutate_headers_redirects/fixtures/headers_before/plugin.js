import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

const fixtureHeadersPath = fileURLToPath(new URL('headers_file', import.meta.url))
const headersPath = fileURLToPath(new URL('_headers', import.meta.url))

export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.headers = [...netlifyConfig.headers, { for: '/path', values: { test: 'two' } }]
}

export const onBuild = async function () {
  await fs.copyFile(fixtureHeadersPath, headersPath)
}

export const onPostBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
