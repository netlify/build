import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

const fixtureRedirectsPath = fileURLToPath(new URL('redirects_file', import.meta.url))
const redirectsPath = fileURLToPath(new URL('_redirects', import.meta.url))

export default {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/three', to: '/four' }]
  },
  async onBuild() {
    await fs.copyFile(fixtureRedirectsPath, redirectsPath)
  },
  onPostBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
