import { relative } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import { expect, test } from 'vitest'

import { getBuildInfo } from '../src/get-build-info.js'

const FIXTURES_ABSOLUTE_PATH = fileURLToPath(new URL('fixtures', import.meta.url))
const FIXTURES_RELATIVE_PATH = relative(cwd(), FIXTURES_ABSOLUTE_PATH)

test('js-workspaces: project without package.json does not return workspaces info', async () => {
  const { jsWorkspaces } = await getBuildInfo({
    projectDir: `${FIXTURES_RELATIVE_PATH}/empty`,
  })

  expect(jsWorkspaces).toBe(undefined)
})

test('js-workspaces: project without workspaces in package.json does not return workspaces info', async () => {
  const { jsWorkspaces } = await getBuildInfo({
    projectDir: `${FIXTURES_RELATIVE_PATH}/simple-package-json`,
  })
  expect(jsWorkspaces).toBe(undefined)
})

test('js-workspaces: projectDir set to workspaces root returns workspace info and isRoot flag set to true', async () => {
  const { jsWorkspaces } = await getBuildInfo({
    projectDir: `${FIXTURES_RELATIVE_PATH}/js-workspaces`,
  })
  expect(jsWorkspaces).not.toBe(undefined)
  expect(jsWorkspaces?.isRoot).toBe(true)
  expect(jsWorkspaces?.packages.length).toBe(2)
})

test('js-workspaces: projectDir set to workspace dir returns workspace info and isRoot flag set to false', async () => {
  const { jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_RELATIVE_PATH}/js-workspaces`,
    projectDir: 'packages/gatsby-site',
  })
  expect(jsWorkspaces).not.toBe(undefined)
  expect(jsWorkspaces?.isRoot).toBe(false)
  expect(jsWorkspaces?.packages.length).toBe(2)
})

test('js-workspaces: if project is not part of a workspace return no workspace info', async () => {
  const { jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_RELATIVE_PATH}/js-workspaces`,
    projectDir: 'not-in-workspace',
  })
  expect(jsWorkspaces).toBe(undefined)
})

test('js-workspaces: handles absolute paths correctly', async () => {
  const { jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
    projectDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces/packages/gatsby-site`,
  })
  expect(jsWorkspaces).not.toBe(undefined)
  expect(jsWorkspaces?.isRoot).toBe(false)
  expect(jsWorkspaces?.packages.length).toBe(2)
})

test('frameworks: return an empty array if no frameworks are detected', async () => {
  const { frameworks } = await getBuildInfo({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/empty`,
  })
  expect(frameworks).toEqual([])
})

test('all: should detect workspaces and frameworks', async () => {
  const { frameworks, jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
    projectDir: 'packages/gatsby-site',
  })
  expect(jsWorkspaces).not.toBe(undefined)
  expect(frameworks.length).toBe(1)
})

test('all: detects workspaces and frameworks when given a rootDir and an empty projectDir', async () => {
  const { frameworks, jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
    projectDir: '',
  })
  expect(jsWorkspaces).not.toBe(undefined)
  expect(frameworks.length).toBe(1)
})
