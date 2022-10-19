import { resolve } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import { test, expect } from 'vitest'

import { getContext } from '../src/context.js'

const FIXTURES_ABSOLUTE_PATH = fileURLToPath(new URL('fixtures', import.meta.url))

test('context: if no options are provided set projectDir to cwd', async () => {
  const { projectDir, rootDir } = await getContext()
  expect(projectDir).toBe(cwd())
  expect(rootDir).toBe(undefined)
})

test('context: given a relative projectDir and a rootDir, resolve projectDir from rootDir', async () => {
  const argRootDir = '/root'
  const argProjectDir = 'some/relative/path'
  const { projectDir, rootDir, rootPackageJson } = await getContext({ projectDir: argProjectDir, rootDir: argRootDir })
  expect(projectDir).toBe(resolve(argRootDir, argProjectDir))
  expect(rootDir).toBe(resolve(`${rootDir}`))
  expect(rootPackageJson).toEqual({})
})

test('context: given an empty projectDir and a rootDir, resolve projectDir to rootDir', async () => {
  const argRootDir = '/root/dir'
  const argProjectDir = ''
  const { projectDir, rootDir, rootPackageJson } = await getContext({ projectDir: argProjectDir, rootDir: argRootDir })
  expect(projectDir).toBe(resolve(argRootDir))
  expect(rootDir).toBe(undefined)
  expect(rootPackageJson).toEqual({})
})

test('context: given a relative rootDir resolve from cwd', async () => {
  const argRootDir = 'root'
  const argProjectDir = 'some/relative/path'
  const { projectDir, rootDir, rootPackageJson } = await getContext({ projectDir: argProjectDir, rootDir: argRootDir })
  expect(projectDir).toBe(resolve(cwd(), argRootDir, argProjectDir))
  expect(rootDir).toBe(resolve(cwd(), argRootDir))
  expect(rootPackageJson).toEqual({})
})

test('context: given absolute dirs rely on them', async () => {
  const argRootDir = '/root/dir'
  const argProjectDir = '/root/dir/sub/project/dir'
  const { projectDir, rootDir, rootPackageJson } = await getContext({ projectDir: argProjectDir, rootDir: argRootDir })
  expect(projectDir).toBe(resolve(argProjectDir))
  expect(rootDir).toBe(resolve(argRootDir))
  expect(rootPackageJson).toEqual({})
})

test('context: extract the rootPackageJson if there is one within rootDir', async () => {
  const { rootPackageJson } = await getContext({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
    projectDir: 'packages/package-2',
  })
  expect(rootPackageJson.name).toBe('js-workspaces')
})

test('context: extract the rootPackageJson from projectDir if no rootDir is provided', async () => {
  const { rootPackageJson, rootDir } = await getContext({
    projectDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces/packages/package-2`,
  })
  expect(rootDir).toBe(undefined)
  expect(rootPackageJson.name).toBe('simple-package-json')
})
