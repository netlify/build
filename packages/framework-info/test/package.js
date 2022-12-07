import test from 'ava'
import cpy from 'cpy'
import del from 'del'
import { dir as getTmpDir } from 'tmp-promise'

import { listFrameworks } from '../src/main.js'

import { getFrameworks, FIXTURES_DIR } from './helpers/main.js'

test('Should detect package.json in parent directories', async (t) => {
  const frameworks = await getFrameworks('parent_package/parent')
  t.is(frameworks.length, 1)
})

test('Should work without a package.json', async (t) => {
  const { path: tmpDir } = await getTmpDir()
  try {
    await cpy('**', tmpDir, { cwd: `${FIXTURES_DIR}/no_package`, parents: true })
    const frameworks = await listFrameworks({ projectDir: tmpDir })
    t.is(frameworks.length, 1)
  } finally {
    del(tmpDir, { force: true })
  }
})

test('Should ignore invalid package.json', async (t) => {
  const frameworks = await getFrameworks('invalid_package')
  t.is(frameworks.length, 0)
})

test('Should ignore package.json with a wrong syntax', async (t) => {
  const frameworks = await getFrameworks('syntax_package')
  t.is(frameworks.length, 0)
})

test('Should ignore invalid package.json dependencies', async (t) => {
  const frameworks = await getFrameworks('invalid_dependencies')
  t.is(frameworks.length, 1)
})

test('Should ignore invalid package.json scripts', async (t) => {
  const frameworks = await getFrameworks('invalid_scripts')
  t.is(frameworks.length, 1)
})

test('Should ignore empty package.json scripts', async (t) => {
  const frameworks = await getFrameworks('empty_scripts')
  t.is(frameworks.length, 1)
})
