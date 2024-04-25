import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

const fixtureRedirectsPath = fileURLToPath(new URL('redirects_file', import.meta.url))
const redirectsPath = fileURLToPath(new URL('_redirects', import.meta.url))

export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/three', to: '/four' }]
}

export const onBuild = async function () {
  await fs.copyFile(fixtureRedirectsPath, redirectsPath)
}

export const onPostBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}
