import { platform } from 'process'
import { fileURLToPath } from 'url'

import test from 'ava'
import { execa, Options } from 'execa'
import semver from 'semver'

import { run, runCommand } from '../src/main.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))
const RUN_FILE = `${FIXTURES_DIR}/run.js`

const runInChildProcess = function (command: string, options: Options = new Object()) {
  const optionsA = options === undefined ? [] : [JSON.stringify(options)]
  return execa('node', [RUN_FILE, command, ...optionsA])
}

test('Should expose several methods', (t) => {
  t.is(typeof run, 'function')
  t.is(typeof runCommand, 'function')
})

test('Can run a command as a single string', async (t) => {
  const { stdout } = await runCommand('ava --version', { stdio: 'pipe' })
  t.truthy(semver.valid(stdout))
})

// `echo` in `cmd.exe` is different from Unix
if (platform !== 'win32') {
  test('Can run with no arguments', async (t) => {
    const { stdout } = await run('echo', [], { stdio: 'pipe' })
    t.is(stdout.trim(), '')
  })

  test('Can run with no arguments nor options object', async (t) => {
    const { stdout } = await run('echo')
    t.is(stdout.trim(), '')
  })
}

test('Can run local binaries', async (t) => {
  const { stdout } = await run('ava', ['--version'], { stdio: 'pipe' })
  t.truthy(semver.valid(stdout))
})

test('Should redirect stdout/stderr to parent', async (t) => {
  const { stdout } = await runInChildProcess('ava --version')
  t.truthy(semver.valid(stdout))
})

test('Should not redirect stdout/stderr to parent when using "stdio" option', async (t) => {
  const { stdout } = await runInChildProcess('ava --version', { stdio: 'pipe' })
  t.is(stdout, '')
})

test('Should not redirect stdout/stderr to parent when using "stdout" option', async (t) => {
  const { stdout } = await runInChildProcess('ava --version', { stdout: 'pipe' })
  t.is(stdout, '')
})

test('Should not redirect stdout/stderr to parent when using "stderr" option', async (t) => {
  const { stdout } = await runInChildProcess('ava --version', { stderr: 'pipe' })
  t.is(stdout, '')
})
