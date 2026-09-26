import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execPath, platform } from 'node:process'

import { afterEach, expect, test } from 'vitest'

import { run, runCommand } from '../src/main.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

const createProject = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'run-utils-options-'))
  directories.push(directory)
  return directory
}

test('runCommand resolves project-local binaries by default and honors preferLocal: false', async () => {
  const cwd = await createProject()
  const bin = join(cwd, 'node_modules', '.bin')
  await mkdir(bin, { recursive: true })
  const command = 'netlify-run-utils-local-fixture'
  await writeFile(join(bin, command), '#!/usr/bin/env node\nconsole.log("project-local")\n', { mode: 0o755 })
  if (platform === 'win32') {
    await writeFile(join(bin, `${command}.cmd`), '@echo project-local\r\n')
  }

  const { stdout } = await runCommand(command, { cwd, stdio: 'pipe' })
  expect(stdout).toBe('project-local')
  await expect(runCommand(command, { cwd, stdio: 'pipe', preferLocal: false })).rejects.toMatchObject({
    code: 'ENOENT',
  })
})

test('run preserves options when the arguments array is omitted', async () => {
  const cwd = await createProject()
  const child = run(execPath, undefined, { cwd, env: { RUN_UTILS_TEST: 'child-value' }, stdio: 'pipe' })
  child.stdin!.end('console.log(JSON.stringify({ cwd: process.cwd(), value: process.env.RUN_UTILS_TEST }))')
  const { stdout } = await child
  expect(JSON.parse(stdout)).toEqual({ cwd: await realpath(cwd), value: 'child-value' })
})
