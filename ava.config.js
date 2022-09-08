import fs from 'fs'
import path from 'path'
import process from 'process'

// eslint-disable-next-line n/no-unpublished-import
import { isCI } from 'ci-info'

// `tests-metadata.json` is created by running `npm run test:measure`
// eslint-disable-next-line n/no-sync
const testData = JSON.parse(fs.readFileSync('tests-metadata.json'))

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
  files: [
    'packages/config/tests/other.test.js',
    'packages/*/lib/tests/*.{cjs,mjs,js}',
    'packages/*/lib/tests/**/tests.{cjs,mjs,js}',
  ],
  verbose: true,
  timeout: '150s',
  workerThreads: false,
  environmentVariables: {
    FORCE_COLOR: '1',
  },
  extensions: {
    js: true,
  },
  ...(isCI && { sortTestFiles }),
}

export default config
