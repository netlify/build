import { version as nodeVersion } from 'process'

import { expect, test } from 'vitest'

import { getFrameworks } from './helpers/main.js'

test('Should detect dependencies', async () => {
  const frameworks = await getFrameworks('dependencies')
  expect(frameworks).toHaveLength(1)
})

test('Should detect devDependencies', async () => {
  const frameworks = await getFrameworks('dev_dependencies')
  expect(frameworks).toHaveLength(1)
})

test('Should ignore empty framework.npmDependencies', async () => {
  const frameworks = await getFrameworks('empty_dependencies')
  expect(frameworks).toHaveLength(1)
})

test('Should detect any of several framework.npmDependencies', async () => {
  const frameworks = await getFrameworks('several_dependencies')
  expect(frameworks).toHaveLength(1)
})

test('Should ignore if matching any framework.excludedNpmDependencies', async () => {
  const frameworks = await getFrameworks('excluded_dependencies')
  expect(frameworks).toHaveLength(1)
})

test('Should detect config files', async () => {
  const frameworks = await getFrameworks('config_files')
  expect(frameworks).toHaveLength(1)
})

if (nodeVersion !== 'v8.3.0') {
  test('Should detect Next.js plugin for Next.js if when Node version >= 10.13.0', async () => {
    const frameworks = await getFrameworks('next-plugin')
    expect(frameworks[0].id).toBe('next')
    expect(frameworks[0].plugins).toEqual(['@opennextjs/netlify'])
  })
}

if (nodeVersion === 'v8.3.0') {
  test('Should not detect Next.js plugin for Next.js if when Node version < 10.13.0', async () => {
    const frameworks = await getFrameworks('next-plugin')
    expect(frameworks[0].id).toBe('next')
    expect(frameworks[0].plugins).toHaveLength(0)
  })
}
