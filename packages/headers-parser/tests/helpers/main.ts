import { fileURLToPath } from 'url'

import { type MinimalHeader, parseAllHeaders } from '../../src/index.js'

const FIXTURES_DIR = fileURLToPath(new URL('../fixtures', import.meta.url))

export const parseHeaders = async function ({
  headersFiles,
  netlifyConfigPath,
  configHeaders,
  ...input
}: {
  headersFiles?: undefined | string[]
  netlifyConfigPath?: undefined | string
  configHeaders?: undefined | MinimalHeader[]
  minimal?: undefined | boolean
}) {
  return await parseAllHeaders({
    ...(headersFiles && { headersFiles: headersFiles.map(addFileFixtureDir) }),
    ...(netlifyConfigPath && { netlifyConfigPath: addConfigFixtureDir(netlifyConfigPath) }),
    configHeaders,
    // Default `minimal` to `true` but still allows passing `undefined` to
    // test the default value of that option
    minimal: 'minimal' in input ? input.minimal : true,
  })
}

const addFileFixtureDir = function (name: string): string {
  return `${FIXTURES_DIR}/headers_file/${name}`
}

const addConfigFixtureDir = function (name: string): string {
  return `${FIXTURES_DIR}/netlify_config/${name}.toml`
}
