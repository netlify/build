import fs from 'fs'
import path from 'path'
import process from 'process'
import { fileURLToPath } from 'url'

// eslint-disable-next-line n/no-unpublished-import
import { isCI } from 'ci-info'

// `tests-metadata.json` is created by running `npm run test:measure`
// eslint-disable-next-line n/no-sync
const testData = JSON.parse(fs.readFileSync(fileURLToPath(new URL('tests-metadata.json', import.meta.url)), 'utf-8'))

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
  files: ['packages/**/tests/*.{cjs,mjs,js}', 'packages/**/tests/**/tests.{cjs,mjs,js}'],
  verbose: true,
  timeout: '120s',
  workerThreads: false,
  environmentVariables: {
    FORCE_COLOR: '1',
  },
  // we only sort in CI to split efficiently across machines
  ...(isCI && { sortTestFiles }),
}

export default config
