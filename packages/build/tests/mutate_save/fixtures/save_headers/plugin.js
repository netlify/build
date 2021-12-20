import { copyFile } from 'fs'
import { fileURLToPath } from 'url'
import { promisify } from 'util'

const pCopyFile = promisify(copyFile)

const fixtureHeadersPath = fileURLToPath(new URL('_headers_file', import.meta.url))
const headersPath = fileURLToPath(new URL('_headers', import.meta.url))

export default {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.headers = [...netlifyConfig.headers, { for: '/path', values: { test: 'two' } }]
  },
  async onBuild() {
    await pCopyFile(fixtureHeadersPath, headersPath)
  },
  onPostBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
