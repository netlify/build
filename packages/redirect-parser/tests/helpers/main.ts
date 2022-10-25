import { fileURLToPath } from 'url'

import { parseAllRedirects } from '../../src/index.js'

const FIXTURES_DIR = fileURLToPath(new URL('../fixtures', import.meta.url))

export const parseRedirects = async function ({ redirectsFiles, netlifyConfigPath, configRedirects, minimal }: any) {
  return await parseAllRedirects({
    ...(redirectsFiles && { redirectsFiles: redirectsFiles.map(addFileFixtureDir) }),
    ...(netlifyConfigPath && { netlifyConfigPath: addConfigFixtureDir(netlifyConfigPath) }),
    configRedirects,
    minimal,
  })
}

const addFileFixtureDir = function (name) {
  return `${FIXTURES_DIR}/redirects_file/${name}`
}

const addConfigFixtureDir = function (name) {
  return `${FIXTURES_DIR}/netlify_config/${name}.toml`
}

// Assign default values to redirects
export const normalizeRedirect = function (redirect, { minimal }: any) {
  return {
    ...(minimal || ADDED_DEFAULT_REDIRECTS),
    ...DEFAULT_REDIRECT,
    ...redirect,
  }
}

const ADDED_DEFAULT_REDIRECTS = {
  proxy: false,
}

const DEFAULT_REDIRECT = {
  force: false,
  query: {},
  conditions: {},
  headers: {},
}
