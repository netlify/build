import { fileURLToPath } from 'url'

import { parseAllRedirects } from '../../src/index.js'

const FIXTURES_DIR = fileURLToPath(new URL('../fixtures', import.meta.url))

// Pass an `input` to the main method and assert its output
export const validateSuccess = async function (t, { input, output }) {
  const { redirects } = await parseRedirects(input)
  t.deepEqual(
    redirects,
    output.map((redirect) => normalizeRedirect(redirect, input)),
  )
}

// Pass an `input` to the main method and assert it fails with a specific error
export const validateErrors = async function (t, { input, errorMessage }) {
  const { errors } = await parseRedirects(input)
  t.not(errors.length, 0)
  t.true(errors.some((error) => errorMessage.test(error.message)))
}

const parseRedirects = async function ({ redirectsFiles, netlifyConfigPath, configRedirects, minimal }) {
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
const normalizeRedirect = function (redirect, { minimal }) {
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
