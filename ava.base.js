import fs, { existsSync } from 'fs'
import path from 'path'
import process from 'process'

import { isCI } from 'ci-info'
import * as execa from 'execa'

const { execaCommand } = execa
if (process.argv.includes('-w')) {
  execaCommand('tsc -w', { cleanup: true })
}

// `tests-metadata.json` is created by running `npx lerna run test:measure --scope @netlify/build`
const testData = existsSync('tests-metadata.json') ? JSON.parse(fs.readFileSync('tests-metadata.json', 'utf-8')) : {}

const getOrder = (file) => {
  const fileRelative = path.relative(process.cwd(), file).replace(/\\/g, '/')
  if (testData[fileRelative]) {
    return testData[fileRelative].order
  }

  console.warn(`Missing test metadata for ${fileRelative}`)
  return Number.MAX_SAFE_INTEGER
}

const sortTestFiles = (file1, file2) => getOrder(file1) - getOrder(file2)

const config = {
  files: ['packages/**/tests/*.{cjs,mjs,ts,js}', 'packages/**/tests/**/tests.{cjs,mjs,ts,js}'],
  verbose: true,
  timeout: '240s',
  workerThreads: false,
  ignoredByWatcher: ['packages/*/tests/*/fixtures/**'],
  environmentVariables: {
    FORCE_COLOR: '1',
  },
  extensions: {
    ts: 'module',
    js: true,
  },
  nodeArguments: ['--loader=tsx'],
  // we only sort in CI to split efficiently across machines
  ...(isCI && { sortTestFiles }),
}

export default config
