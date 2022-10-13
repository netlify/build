import { relative } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import { execa } from 'execa'
import { expect, test } from 'vitest'

const FIXTURES_ABSOLUTE_PATH = fileURLToPath(new URL('fixtures', import.meta.url))
const FIXTURES_RELATIVE_PATH = relative(cwd(), FIXTURES_ABSOLUTE_PATH)

const runBinary = (...args: string[]) => {
  const binary = fileURLToPath(new URL('../src/bin.ts', import.meta.url))
  return execa('node', ['--loader=ts-node/esm', '--no-warnings', binary, ...args])
}

test('CLI --help flag', async () => {
  const { stdout } = await runBinary('--help')

  expect(stdout).toMatchSnapshot()
})

test('CLI prints js-workspaces and frameworks in JSON format', async () => {
  const { stdout } = await runBinary(
    `${FIXTURES_ABSOLUTE_PATH}/js-workspaces/packages/gatsby-site`,
    '--rootDir',
    `${FIXTURES_ABSOLUTE_PATH}/js-workspaces`,
  )
  const { jsWorkspaces, frameworks } = JSON.parse(stdout)
  expect(jsWorkspaces.isRoot).toBe(false)
  expect(jsWorkspaces.packages.length).toBe(2)
  expect(frameworks.length).toBe(1)
})

test('CLI does not print js-workspaces if given a project without it', async () => {
  const { stdout } = await runBinary(`${FIXTURES_ABSOLUTE_PATH}/js-workspaces/packages/gatsby-site`)
  const { jsWorkspaces } = JSON.parse(stdout)
  expect(jsWorkspaces).toBe(undefined)
})

test('CLI works if given a relative path and no rootDir', async () => {
  const { stdout } = await runBinary(`${FIXTURES_RELATIVE_PATH}/js-workspaces`)
  const { jsWorkspaces, frameworks } = JSON.parse(stdout)
  expect(jsWorkspaces).not.toBe(undefined)
  expect(frameworks.length).toBe(1)
})

test('CLI prints an empty array if no frameworks are found', async () => {
  const { stdout } = await runBinary(`${FIXTURES_ABSOLUTE_PATH}/empty`)
  const { frameworks } = JSON.parse(stdout)
  expect(frameworks).toEqual([])
})
