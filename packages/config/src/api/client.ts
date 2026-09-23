import { NetlifyAPI } from '@netlify/api'

import type { TestOptions } from '../types/options.js'
import { removeUndefined } from '../utils/remove_falsy.js'

type ApiClientOptions = {
  token: string | undefined
  offline: boolean
  testOpts: TestOptions
  host: string | undefined
  scheme: string | undefined
  pathPrefix: string | undefined
}

/** A Netlify API client, when there is a token and the build isn't offline. */
export const getApiClient = function ({
  token,
  offline,
  testOpts,
  host,
  scheme,
  pathPrefix,
}: ApiClientOptions): NetlifyAPI | undefined {
  if (!token || offline) {
    return
  }

  const parameters = removeUndefined({
    scheme: nonEmpty(testOpts.scheme) ?? scheme,
    host: nonEmpty(testOpts.host) ?? host,
    pathPrefix,
  })
  return new NetlifyAPI(token, parameters)
}

// An empty test value falls back to the option, as it always has.
const nonEmpty = (value: string | undefined) => (value === '' ? undefined : value)
