const test = require('ava')

const getGitUtils = require('..')

// Runs the git utils against very old commits of @netlify/build so that the
// tests are stable. The following are static statistics for that git range.
const BASE = '6bdf580f'
const HEAD = '152867c2'
const UNKNOWN_COMMIT = 'aaaaaaaa'
const DEFAULT_OPTS = { base: BASE, head: HEAD }

test('Should define all its methods and properties', t => {
  const git = getGitUtils(DEFAULT_OPTS)
  t.deepEqual(Object.keys(git).sort(), [
    'commits',
    'createdFiles',
    'deletedFiles',
    'fileMatch',
    'linesOfCode',
    'modifiedFiles',
  ])
})

test('Should be callable with no options', t => {
  const { linesOfCode } = getGitUtils()
  t.true(Number.isInteger(linesOfCode))
})

test('Option "head" should have a default value', t => {
  const { linesOfCode } = getGitUtils({ base: BASE })
  t.true(Number.isInteger(linesOfCode))
})

test('Options "base" and "head" can be the same commit', t => {
  const { linesOfCode, modifiedFiles, createdFiles, deletedFiles } = getGitUtils({ base: HEAD, head: HEAD })
  t.is(linesOfCode, 0)
  t.deepEqual(modifiedFiles, [])
  t.deepEqual(createdFiles, [])
  t.deepEqual(deletedFiles, [])
})

test('Should error when the option "base" points to an unknown commit', t => {
  t.throws(() => getGitUtils({ base: UNKNOWN_COMMIT, head: HEAD }), { message: /Invalid base commit/ })
})

test('Should error when the option "head" points to an unknown commit', t => {
  t.throws(() => getGitUtils({ base: BASE, head: UNKNOWN_COMMIT }), { message: /Invalid head commit/ })
})

test.serial('Should allow using the environment variable CACHED_COMMIT_REF', t => {
  try {
    process.env.CACHED_COMMIT_REF = BASE
    const { linesOfCode } = getGitUtils({ head: HEAD })
    t.is(linesOfCode, 163)
  } finally {
    delete process.env.CACHED_COMMIT_REF
  }
})

test.serial('Should allow overriding the current directory', t => {
  const currentCwd = process.cwd()
  try {
    process.chdir('/')
    const { linesOfCode } = getGitUtils({ ...DEFAULT_OPTS, cwd: currentCwd })
    t.is(linesOfCode, 163)
  } finally {
    process.chdir(currentCwd)
  }
})

test('Should return the number of lines of code', t => {
  const { linesOfCode } = getGitUtils(DEFAULT_OPTS)
  t.is(linesOfCode, 163)
})

test.skip('Should return the commits', t => {
  const { commits } = getGitUtils(DEFAULT_OPTS)
  t.is(commits.length, 3)
  t.deepEqual(commits[0], {
    sha: '152867c29d975a929f60d35b4a8a05d94661d517',
    parents: 'bf7ed523',
    author: { name: 'DavidWells', email: 'hello@davidwells.io', date: '2019-06-11 21:25:51 -0700' },
    committer: { name: 'DavidWells', email: 'hello@davidwells.io', date: '2019-06-11 21:25:51 -0700' },
    message: 'add-npm-logic',
  })
})

test('Should return the modified/created/deleted files', t => {
  const { modifiedFiles, createdFiles, deletedFiles } = getGitUtils(DEFAULT_OPTS)
  t.deepEqual(modifiedFiles, ['src/install/node/bower.js'])
  t.deepEqual(createdFiles, ['src/install/node/install-node.js', 'src/install/node/run-npm.js'])
  t.deepEqual(deletedFiles, ['src/install/node/index.js', 'src/install/node/npm.js'])
})

test('Should return whether specific files are modified/created/deleted/edited', t => {
  const { fileMatch } = getGitUtils(DEFAULT_OPTS)
  const { modified, created, deleted, edited } = fileMatch('**/*npm*', '!**/*run-npm*')
  t.deepEqual(modified, [])
  t.deepEqual(created, [])
  t.deepEqual(deleted, ['src/install/node/npm.js'])
  t.deepEqual(edited, [])
})
