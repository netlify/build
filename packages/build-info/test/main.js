import { relative } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import test from 'ava'

import { getBuildInfo } from '../src/main.js'

const FIXTURES_ABSOLUTE_PATH = fileURLToPath(new URL('fixtures', import.meta.url))
const FIXTURES_RELATIVE_PATH = relative(cwd(), FIXTURES_ABSOLUTE_PATH)

test('js-workspaces: project without package.json does not return workspaces info', async (t) => {
  const { jsWorkspaces } = await getBuildInfo({
    projectDir: `${FIXTURES_RELATIVE_PATH}/empty`,
  })
  t.is(jsWorkspaces, undefined)
})

test('js-workspaces: project without workspaces in package.json does not return workspaces info', async (t) => {
  const { jsWorkspaces } = await getBuildInfo({
    projectDir: `${FIXTURES_RELATIVE_PATH}/simple-package-json`,
  })
  t.is(jsWorkspaces, undefined)
})

test('js-workspaces: projectDir set to workspaces root returns workspace info and isRoot flag set to true', async (t) => {
  const { jsWorkspaces } = await getBuildInfo({
    projectDir: `${FIXTURES_RELATIVE_PATH}/js-workspaces`,
  })
  t.not(jsWorkspaces, undefined)
  t.true(jsWorkspaces.isRoot)
  t.is(jsWorkspaces.packages.length, 2)
})

test('js-workspaces: projectDir set to workspace dir returns workspace info and isRoot flag set to false', async (t) => {
  const { jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_RELATIVE_PATH}/js-workspaces`,
    projectDir: 'packages/gatsby-site',
  })
  t.not(jsWorkspaces, undefined)
  t.false(jsWorkspaces.isRoot)
  t.is(jsWorkspaces.packages.length, 2)
})

test('js-workspaces: if project is not part of a workspace return no workspace info', async (t) => {
  const { jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_RELATIVE_PATH}/js-workspaces`,
    projectDir: 'not-in-workspace',
  })
  t.is(jsWorkspaces, undefined)
})

test('js-workspaces: handles absolute paths correctly', async (t) => {
  const { jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
    projectDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces/packages/gatsby-site`,
  })
  t.not(jsWorkspaces, undefined)
  t.false(jsWorkspaces.isRoot)
  t.is(jsWorkspaces.packages.length, 2)
})

test('frameworks: return an empty array if no frameworks are detected', async (t) => {
  const { frameworks } = await getBuildInfo({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/empty`,
  })
  t.deepEqual(frameworks, [])
})

test('all: should detect workspaces and frameworks', async (t) => {
  const { frameworks, jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
    projectDir: 'packages/gatsby-site',
  })
  t.not(jsWorkspaces, undefined)
  t.is(frameworks.length, 1)
})

test('all: detects workspaces and frameworks when given a rootDir and an empty projectDir', async (t) => {
  const { frameworks, jsWorkspaces } = await getBuildInfo({
    rootDir: `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
    projectDir: '',
  })
  t.not(jsWorkspaces, undefined)
  t.is(frameworks.length, 1)
})
