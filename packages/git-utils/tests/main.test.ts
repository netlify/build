import { execFileSync } from 'child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { cwd as getCwd, env } from 'process'

import { expect, test, vi } from 'vitest'

import { getGitUtils } from '../src/main.js'

// Runs the git utils against very old commits of @netlify/build so that the
// tests are stable. The following are static statistics for that git range.
const BASE = '6bdf580f'
const HEAD = '152867c2'
const UNKNOWN_COMMIT = 'aaaaaaaa'
const DEFAULT_OPTS = { base: BASE, head: HEAD }

test('Should define all its methods and properties', () => {
  const git = getGitUtils(DEFAULT_OPTS)
  expect(Object.keys(git).sort()).toEqual([
    'commits',
    'createdFiles',
    'deletedFiles',
    'fileMatch',
    'linesOfCode',
    'modifiedFiles',
  ])
})

test('Should be callable with no options', () => {
  const { linesOfCode } = getGitUtils()
  expect(Number.isInteger(linesOfCode)).toBe(true)
})

test('Option "head" should have a default value', () => {
  const { linesOfCode } = getGitUtils({ base: BASE })
  expect(Number.isInteger(linesOfCode)).toBe(true)
})

test('Options "base" and "head" can be the same commit', () => {
  const { linesOfCode, modifiedFiles, createdFiles, deletedFiles } = getGitUtils({ base: HEAD, head: HEAD })
  expect(linesOfCode).toBe(0)
  expect(modifiedFiles).toEqual([])
  expect(createdFiles).toEqual([])
  expect(deletedFiles).toEqual([])
})

test('Should error when the option "base" points to an unknown commit', () => {
  expect(() => getGitUtils({ base: UNKNOWN_COMMIT, head: HEAD })).toThrowError(/Invalid base commit/)
})

test('Should error when the option "head" points to an unknown commit', () => {
  expect(() => getGitUtils({ base: BASE, head: UNKNOWN_COMMIT })).toThrowError(/Invalid head commit/)
})

test('Errors should include the git stderr', () => {
  expect(() => getGitUtils({ base: BASE, head: UNKNOWN_COMMIT })).toThrowError(/unknown revision/)
})

const LINES_OF_CODE = 163

test('Should allow using the environment variable CACHED_COMMIT_REF', () => {
  try {
    env.CACHED_COMMIT_REF = BASE
    const { linesOfCode } = getGitUtils({ head: HEAD })
    expect(linesOfCode).toBe(LINES_OF_CODE)
  } finally {
    delete env.CACHED_COMMIT_REF
  }
})

test('Should allow overriding the current directory', () => {
  const currentCwd = getCwd()
  const cwdSpy = vi.spyOn(process, 'cwd').mockImplementation(() => '/')
  const { linesOfCode } = getGitUtils({ ...DEFAULT_OPTS, cwd: currentCwd })
  expect(linesOfCode).toBe(LINES_OF_CODE)
  cwdSpy.mockRestore()
})

test('Should throw when the current directory is invalid', () => {
  expect(() => {
    getGitUtils({ ...DEFAULT_OPTS, cwd: '/does/not/exist' })
  }).toThrow()
})

test('Should return the number of lines of code', () => {
  const { linesOfCode } = getGitUtils(DEFAULT_OPTS)
  expect(linesOfCode).toBe(LINES_OF_CODE)
})

test('Should return the commits', () => {
  const { commits } = getGitUtils(DEFAULT_OPTS)
  expect(commits.length).toBe(3)
  const [{ sha, author, committer, message }] = commits
  expect({ sha, author, committer, message }).toEqual({
    sha: '152867c29d975a929f60d35b4a8a05d94661d517',
    author: { name: 'DavidWells', email: 'hello@davidwells.io', date: '2019-06-11 21:25:51 -0700' },
    committer: { name: 'DavidWells', email: 'hello@davidwells.io', date: '2019-06-11 21:25:51 -0700' },
    message: 'add-npm-logic',
  })
})

test('Should return the modified/created/deleted files', () => {
  const { modifiedFiles, createdFiles, deletedFiles } = getGitUtils(DEFAULT_OPTS)
  expect(modifiedFiles).toEqual(['src/install/node/bower.js'])
  expect(createdFiles).toEqual(['src/install/node/install-node.js', 'src/install/node/run-npm.js'])
  expect(deletedFiles).toEqual(['src/install/node/index.js', 'src/install/node/npm.js'])
})

// Windows strips trailing spaces from filenames at the Win32 layer
test.skipIf(process.platform === 'win32')('Should preserve filenames ending with a space', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'git-utils-'))
  const gitEnv = {
    ...env,
    GIT_AUTHOR_NAME: 'Test',
    GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'Test',
    GIT_COMMITTER_EMAIL: 'test@example.com',
  }
  const runGit = (...args: string[]) => execFileSync('git', args, { cwd, env: gitEnv }).toString().trim()

  try {
    runGit('init')
    runGit('commit', '--allow-empty', '-m', 'base')
    const base = runGit('rev-parse', 'HEAD')
    writeFileSync(join(cwd, 'file '), '')
    runGit('add', '.')
    runGit('commit', '-m', 'head')
    const head = runGit('rev-parse', 'HEAD')

    const { createdFiles } = getGitUtils({ base, head, cwd })
    expect(createdFiles).toEqual(['file '])
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})

test('Should return whether specific files are modified/created/deleted/edited', () => {
  const { fileMatch } = getGitUtils(DEFAULT_OPTS)
  const { modified, created, deleted, edited } = fileMatch('**/*npm*', '!**/*run-npm*')
  expect(modified).toEqual([])
  expect(created).toEqual([])
  expect(deleted).toEqual(['src/install/node/npm.js'])
  expect(edited).toEqual([])
})
