import { removeUndefined } from '../utils/remove_falsy.js'

// TODO: use static `import` after migrating `@netlify/config` to pure ES modules
const jsClient = import('netlify')

// Retrieve Netlify API client, if an access token was passed
export const getApiClient = async function ({ token, offline, testOpts = {}, host, scheme, pathPrefix }) {
  if (!token || offline) {
    return
  }

  // TODO: find less intrusive way to mock HTTP requests
  const parameters = removeUndefined({ scheme: testOpts.scheme || scheme, host: testOpts.host || host, pathPrefix })
  const { NetlifyAPI } = await jsClient
  const api = new NetlifyAPI(token, parameters)
  return api
}
