import { copyFile } from 'fs'
import { fileURLToPath } from 'url'
import { promisify } from 'util'

const pCopyFile = promisify(copyFile)

const fixtureRedirectsPath = fileURLToPath(new URL('redirects_file', import.meta.url))
const redirectsPath = fileURLToPath(new URL('_redirects', import.meta.url))

export default {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/three', to: '/four' }]
  },
  async onBuild() {
    await pCopyFile(fixtureRedirectsPath, redirectsPath)
  },
  onPostBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
