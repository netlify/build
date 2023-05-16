import { rm } from 'fs/promises'

import cpy from 'cpy'
import { dir as getTmpDir } from 'tmp-promise'
import { expect, test } from 'vitest'

import { listFrameworks } from '../src/main.js'

import { getFrameworks, FIXTURES_DIR } from './helpers/main.js'

test('Should detect package.json in parent directories', async () => {
  const frameworks = await getFrameworks('parent_package/parent')
  expect(frameworks).toHaveLength(1)
})

test('Should work without a package.json', async () => {
  const { path: tmpDir } = await getTmpDir()
  try {
    await cpy(`${FIXTURES_DIR}/no_package/**`, tmpDir)
    const frameworks = await listFrameworks({ projectDir: tmpDir })
    expect(frameworks).toHaveLength(1)
  } finally {
    rm(tmpDir, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Should ignore invalid package.json', async () => {
  const frameworks = await getFrameworks('invalid_package')
  expect(frameworks).toHaveLength(0)
})

test('Should ignore package.json with a wrong syntax', async () => {
  const frameworks = await getFrameworks('syntax_package')
  expect(frameworks).toHaveLength(0)
})

test('Should ignore invalid package.json dependencies', async () => {
  const frameworks = await getFrameworks('invalid_dependencies')
  expect(frameworks).toHaveLength(1)
})

test('Should ignore invalid package.json scripts', async () => {
  const frameworks = await getFrameworks('invalid_scripts')
  expect(frameworks).toHaveLength(1)
})

test('Should ignore empty package.json scripts', async () => {
  const frameworks = await getFrameworks('empty_scripts')
  expect(frameworks).toHaveLength(1)
})
