import { NetlifyPluginUtils, OnPreBuild } from '@netlify/build'
import { expectAssignable, expectError } from 'tsd'

const testUtilsRun: OnPreBuild = function ({ utils: { run } }: { utils: NetlifyPluginUtils }) {
  expectAssignable<Promise<object>>(run('command'))
  run('command', ['arg'])
  run('command', ['arg'], { preferLocal: false })
  expectError(run('command', ['arg'], { unknownOption: false }))

  run.command('command')
}
