import { fileURLToPath } from 'url'

import { parseAllHeaders } from '../../src/index.js'

const FIXTURES_DIR = fileURLToPath(new URL('../fixtures', import.meta.url))

// Pass an `input` to the main method and assert its output
export const validateSuccess = async function (t, { input, output }) {
  const { headers } = await parseHeaders(input)
  t.deepEqual(headers, output)
}

// Pass an `input` to the main method and assert it fails with a specific error
export const validateError = async function (t, { input, errorMessage }) {
  const { errors } = await parseHeaders(input)
  t.not(errors.length, 0)
  t.true(errors.some((error) => errorMessage.test(error.message)))
}

const parseHeaders = async function ({ headersFiles, netlifyConfigPath, configHeaders, ...input }) {
  return await parseAllHeaders({
    ...(headersFiles && { headersFiles: headersFiles.map(addFileFixtureDir) }),
    ...(netlifyConfigPath && { netlifyConfigPath: addConfigFixtureDir(netlifyConfigPath) }),
    configHeaders,
    // Default `minimal` to `true` but still allows passing `undefined` to
    // test the default value of that option
    minimal: 'minimal' in input ? input.minimal : true,
  })
}

const addFileFixtureDir = function (name) {
  return `${FIXTURES_DIR}/headers_file/${name}`
}

const addConfigFixtureDir = function (name) {
  return `${FIXTURES_DIR}/netlify_config/${name}.toml`
}
