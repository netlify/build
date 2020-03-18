const test = require('ava')
const cpy = require('cpy')
const pathExists = require('path-exists')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { createRepoDir, removeDir } = require('../../helpers/dir')

test('Install local plugin dependencies: with npm', async t => {
  await removeDir(`${FIXTURES_DIR}/npm/plugin/node_modules`)
  await runFixture(t, 'npm')
  t.true(await pathExists(`${FIXTURES_DIR}/npm/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/npm/plugin/node_modules`)
})

test('Install local plugin dependencies: with yarn', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
  await runFixture(t, 'yarn')
  t.true(await pathExists(`${FIXTURES_DIR}/yarn/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
})

test('Install local plugin dependencies: propagate errors', async t => {
  await runFixture(t, 'error')
})

test('Install local plugin dependencies: already installed', async t => {
  await runFixture(t, 'already')
})

test('Install local plugin dependencies: no package.json', async t => {
  await runFixture(t, 'no_package')
})

test('Install local plugin dependencies: no root package.json', async t => {
  const tmpDir = await createRepoDir()
  try {
    await cpy('**', tmpDir, { cwd: `${FIXTURES_DIR}/no_root_package`, parents: true })
    await runFixture(t, 'no_root_package', { repositoryRoot: tmpDir })
  } finally {
    await removeDir(tmpDir)
  }
})
