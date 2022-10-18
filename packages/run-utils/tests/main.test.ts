import { platform } from 'process'
import { fileURLToPath } from 'url'

import { execaNode } from 'execa'
import semver from 'semver'
import { test, expect } from 'vitest'

import { run, runCommand } from '../src/main.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))
const RUN_FILE = `${FIXTURES_DIR}/run.js`

const runInChildProcess = (command: string, options?: Record<string, unknown>) => {
  const optionsA = options === undefined ? [] : [JSON.stringify(options)]
  return execaNode(RUN_FILE, [command, ...optionsA])
}

test('Should expose several methods', () => {
  expect(typeof run).toBe('function')
  expect(typeof runCommand).toBe('function')
})

test('Can run a command as a single string', async () => {
  const { stdout } = await runCommand('npx --version', { stdio: 'pipe' })
  expect(semver.valid(stdout)).toBeTruthy()
})

// `echo` in `cmd.exe` is different from Unix
if (platform !== 'win32') {
  test('Can run with no arguments', async () => {
    const { stdout } = await run('echo', { stdio: 'pipe' })
    expect(stdout.trim()).toBe('')
  })

  test('Can run with no arguments nor options object', async () => {
    const { stdout } = await run('echo')
    expect(stdout.trim()).toBe('')
  })
}

test('Can run local binaries', async () => {
  const { stdout } = await run('npx', ['--version'], { stdio: 'pipe' })

  expect(semver.valid(stdout)).toBeTruthy()
})

test('Should redirect stdout/stderr to parent', async () => {
  const { stdout } = await runInChildProcess('npx --version')
  expect(semver.valid(stdout)).toBeTruthy()
})

test('Should not redirect stdout/stderr to parent when using "stdio" option', async () => {
  const { stdout } = await runInChildProcess('ava --version', { stdio: 'pipe' })
  expect(stdout).toBe('')
})

test('Should not redirect stdout/stderr to parent when using "stdout" option', async () => {
  const { stdout } = await runInChildProcess('ava --version', { stdout: 'pipe' })
  expect(stdout).toBe('')
})

test('Should not redirect stdout/stderr to parent when using "stderr" option', async () => {
  const { stdout } = await runInChildProcess('ava --version', { stderr: 'pipe' })
  expect(stdout).toBe('')
})
