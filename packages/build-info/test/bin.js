import { relative } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import test from 'ava'
import { execa } from 'execa'
import { getBinPath } from 'get-bin-path'

const FIXTURES_ABSOLUTE_PATH = fileURLToPath(new URL('fixtures', import.meta.url))
const FIXTURES_RELATIVE_PATH = relative(cwd(), FIXTURES_ABSOLUTE_PATH)

const BINARY_PATH = getBinPath()

test('CLI --help flag', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, ['--help'])
  t.snapshot(stdout)
})

test('CLI prints js-workspaces and frameworks in JSON format', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, [
    `${FIXTURES_ABSOLUTE_PATH}/js-workspaces/packages/gatsby-site`,
    '--rootDir',
    `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
  ])
  const { jsWorkspaces, frameworks } = JSON.parse(stdout)
  t.false(jsWorkspaces.isRoot)
  t.is(jsWorkspaces.packages.length, 2)
  t.is(frameworks.length, 1)
})

test('CLI does not print js-workspaces if given a project without it', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, [`${FIXTURES_ABSOLUTE_PATH}/js-workspaces/packages/gatsby-site`])
  const { jsWorkspaces } = JSON.parse(stdout)
  t.is(jsWorkspaces, undefined)
})

test('CLI works if given a relative path and no rootDir', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, [`${FIXTURES_RELATIVE_PATH}/js-workspaces`])
  const { jsWorkspaces, frameworks } = JSON.parse(stdout)
  t.not(jsWorkspaces, undefined)
  t.is(frameworks.length, 1)
})

test('CLI prints an empty array if no frameworks are found', async (t) => {
  const binPath = await BINARY_PATH
  const { stdout } = await execa(binPath, [`${FIXTURES_ABSOLUTE_PATH}/empty`])
  const { frameworks } = JSON.parse(stdout)
  t.deepEqual(frameworks, [])
})
