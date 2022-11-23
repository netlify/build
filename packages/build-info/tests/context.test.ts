import { resolve } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import { expect, test } from 'vitest'

import { getContext } from '../src/context.js'

const FIXTURES_ABSOLUTE_PATH = fileURLToPath(new URL('fixtures', import.meta.url))

test('if no options are provided rootDir and projectDir are the same', async () => {
  const { projectDir, rootDir } = await getContext()
  expect(projectDir).toBe(cwd())
  expect(rootDir).toBe(undefined)
})

test('given a relative projectDir and a rootDir, resolve projectDir from rootDir', async () => {
  const argRootDir = '/root'
  const argProjectDir = 'some/relative/path'
  const { projectDir, rootDir, rootPackageJson } = await getContext({ projectDir: argProjectDir, rootDir: argRootDir })
  expect(projectDir).toBe(resolve(argRootDir, argProjectDir))
  expect(rootDir).toBe(resolve(`${rootDir}`))
  expect(rootPackageJson).toEqual({})
})

test('given an empty projectDir and a rootDir, resolve projectDir to rootDir', async () => {
  const argRootDir = '/root/dir'
  const argProjectDir = ''
  const { projectDir, rootDir, rootPackageJson } = await getContext({ projectDir: argProjectDir, rootDir: argRootDir })
  expect(projectDir).toBe(resolve(argRootDir))
  expect(rootDir).toBe(undefined)
  expect(rootPackageJson).toEqual({})
})

test('given a relative rootDir resolve from cwd', async () => {
  const argRootDir = 'root'
  const argProjectDir = 'some/relative/path'
  const { projectDir, rootDir, rootPackageJson } = await getContext({ projectDir: argProjectDir, rootDir: argRootDir })
  expect(projectDir).toBe(resolve(cwd(), argRootDir, argProjectDir))
  expect(rootDir).toBe(resolve(cwd(), argRootDir))
  expect(rootPackageJson).toEqual({})
})

test('given absolute dirs rely on them', async () => {
  const argRootDir = '/root/dir'
  const argProjectDir = '/root/dir/sub/project/dir'
  const { projectDir, rootDir, rootPackageJson } = await getContext({ projectDir: argProjectDir, rootDir: argRootDir })
  expect(projectDir).toBe(resolve(argProjectDir))
  expect(rootDir).toBe(resolve(argRootDir))
  expect(rootPackageJson).toEqual({})
})

test('get the package.json from a simple project', async () => {
  const { rootPackageJson } = await getContext({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/yarn-project`,
    projectDir: '',
  })
  expect(rootPackageJson.name).toBe('yarn-project')
})

test('get the package.json from a simple project without projectDir', async () => {
  const ctx = await getContext({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/pnpm-simple`,
    projectDir: '',
  })
  expect(ctx.rootPackageJson.name).toBe('pnpm-simple')
})

test('get the package.json from a nested project', async () => {
  const ctx = await getContext({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/yarn-nested`,
    projectDir: 'projects/website',
  })
  expect(ctx.rootPackageJson.name).toBe('yarn-nested')
})

test('work in non js workspaces as well', async () => {
  const ctx = await getContext({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/go-workspace`,
    projectDir: 'foo',
  })
  expect(ctx.rootPackageJson).toMatchInlineSnapshot('{}')
})

test('extract the rootPackageJson if there is one within rootDir', async () => {
  const { rootPackageJson } = await getContext({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
    projectDir: 'packages/package-2',
  })
  expect(rootPackageJson.name).toBe('js-workspaces')
})

test('extract the rootPackageJson from projectDir if no rootDir is provided', async () => {
  const { rootPackageJson, rootDir } = await getContext({
    projectDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces/packages/package-2`,
  })
  expect(rootDir).toBe(undefined)
  expect(rootPackageJson.name).toBe('simple-package-json')
})
