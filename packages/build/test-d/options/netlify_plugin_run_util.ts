import { expectAssignable, expectError } from 'tsd'

import { onPreBuild } from '../netlify_plugin'

const testUtilsRun: onPreBuild = function ({ utils: { run } }) {
  expectAssignable<Promise<object>>(run('command'))
  run('command', ['arg'])
  run('command', ['arg'], { preferLocal: false })
  expectError(run('command', ['arg'], { unknownOption: false }))

  run.command('command')
}
