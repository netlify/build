import process from 'process'

import * as execa from 'execa'

const { execaCommand } = execa
if (process.argv.includes('-w')) {
  execaCommand('tsc -w', { cleanup: true })
}

const config = {
  files: ['packages/**/tests/*.{cjs,mjs,js}', 'packages/**/tests/**/tests.{cjs,mjs,js}'],
  cache: false,
  verbose: true,
  timeout: '300s',
  ignoredByWatcher: ['packages/*/tests/*/fixtures/**'],
  environmentVariables: {
    FORCE_COLOR: '1',
  },
}

export default config
