import { fileURLToPath } from 'url'

import { execa, execaNode } from 'execa'
import { afterEach, expect, test } from 'vitest'

import { createFixture } from './helpers.js'

const FIXTURES_ABSOLUTE_PATH = fileURLToPath(new URL('fixtures', import.meta.url))

afterEach(async ({ cleanup }) => await cleanup?.())

const runBinary = (...args: string[]) => {
  if (process.env.CI) {
    const binary = fileURLToPath(new URL('../bin.js', import.meta.url))
    return execaNode(binary, args)
  }
  const binary = fileURLToPath(new URL('../src/node/bin.ts', import.meta.url))
  return execa('tsx', ['--no-warnings', binary, ...args])
}

test('CLI --help flag', async () => {
  const { stdout } = await runBinary('--help')

  // locally we run the typescript binary but the snapshot is run in CI as well
  expect(stdout.replace(/bin\.ts/gm, 'bin.js')).toMatchSnapshot()
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

test('CLI does not print js-workspaces if given a project without it', async (ctx) => {
  const fixture = await createFixture('pnpm-simple', ctx)
  const { stdout } = await runBinary(fixture.cwd)
  expect(stdout).toMatchInlineSnapshot(`
    "{
      "frameworks": [],
      "settings": [],
      "langRuntimes": [
        {
          "id": "node",
          "name": "NodeJS"
        }
      ],
      "buildSystems": [],
      "packageManager": {
        "name": "pnpm",
        "installCommand": "pnpm install",
        "runCommand": "pnpm run",
        "localPackageCommand": "pnpm",
        "remotePackageCommand": [
          "pnpm",
          "dlx"
        ],
        "lockFiles": [
          "pnpm-lock.yaml"
        ],
        "forceEnvironment": "NETLIFY_USE_PNPM"
      }
    }"
  `)
  const { jsWorkspaces } = JSON.parse(stdout)
  expect(jsWorkspaces).toBe(undefined)
})

test('CLI works if given a relative path and no rootDir', async (ctx) => {
  const fixture = await createFixture('js-workspaces', ctx)
  const { stdout } = await runBinary(fixture.cwd)
  const { jsWorkspaces, frameworks } = JSON.parse(stdout)
  expect(jsWorkspaces).not.toBe(undefined)
  expect(frameworks.length).toBe(1)
})

test('CLI prints an empty array if no frameworks are found', async (ctx) => {
  const fixture = await createFixture('empty', ctx)
  const { stdout } = await runBinary(fixture.cwd)
  expect(JSON.parse(stdout)).toMatchInlineSnapshot(`
    {
      "buildSystems": [],
      "frameworks": [],
      "langRuntimes": [],
      "settings": [],
    }
  `)
  const { frameworks } = JSON.parse(stdout)
  expect(frameworks).toEqual([])
})
