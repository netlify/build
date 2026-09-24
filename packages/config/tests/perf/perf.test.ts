import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { resolveConfig } from '@netlify/config'
import { execa } from 'execa'
import { afterAll, beforeAll, expect, test } from 'vitest'

import { asConfig } from '../helpers/result.js'

import { LARGE_SITE_BRANCH, LARGE_SITE_CONTEXT, SITE_SIZE, writeLargeSite } from './large_site.js'

const BINARY_PATH = fileURLToPath(new URL('../../bin.js', import.meta.url))
const TYPICAL_SITE = fileURLToPath(new URL('fixtures/typical', import.meta.url))

// About 10 times the measured durations, so only pathological regressions fail, e.g. quadratic code.
const LARGE_SITE_BUDGET_MS = 2000
const TYPICAL_SITE_BUDGET_MS = 2500
const TYPICAL_SITE_CALLS = 20
const BINARY_BUDGET_MS = 5000

// The wildcard `feat/*` context is the last matching entry, so it wins over `deploy-preview`.
const WINNING_CONTEXT_INDEX = '16'

let root = ''

beforeAll(async () => {
  root = await fs.mkdtemp(join(tmpdir(), 'netlify-config-perf-'))
  await writeLargeSite(root)
})

afterAll(async () => {
  await fs.rm(root, { recursive: true, force: true })
})

const resolveLargeSite = () =>
  resolveConfig({
    repositoryRoot: root,
    cwd: root,
    branch: LARGE_SITE_BRANCH,
    context: LARGE_SITE_CONTEXT,
    env: { NETLIFY_AUTH_TOKEN: '' },
    buffer: true,
  })

const timed = async function <T>(run: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await run()
  return { result, duration: performance.now() - start }
}

test('Resolves a large site within budget', async () => {
  const { result, duration } = await timed(resolveLargeSite)

  expect(duration).toBeLessThan(LARGE_SITE_BUDGET_MS)
  expect(result.context).toBe(LARGE_SITE_CONTEXT)
  expect(result.config.build.environment['CONTEXT_INDEX']).toBe(WINNING_CONTEXT_INDEX)
  expect(result.config.redirects).toHaveLength(SITE_SIZE.fileRedirects + SITE_SIZE.configRedirects)
  expect(result.config.headers).toHaveLength(SITE_SIZE.fileHeaders + SITE_SIZE.configHeaders)
  expect(Object.keys(result.config.functions)).toHaveLength(SITE_SIZE.functions + 1)
  expect(result.config.edge_functions).toHaveLength(SITE_SIZE.edgeFunctions)
  expect(result.config.plugins).toHaveLength(SITE_SIZE.plugins)
  expect(result.logs?.stderr).toEqual([])
})

test('Resolves a typical site repeatedly within budget', async () => {
  const { duration } = await timed(async () => {
    for (let index = 0; index < TYPICAL_SITE_CALLS; index++) {
      await resolveConfig({
        repositoryRoot: TYPICAL_SITE,
        cwd: TYPICAL_SITE,
        branch: 'main',
        context: 'production',
        env: { NETLIFY_AUTH_TOKEN: '' },
      })
    }
  })
  expect(duration).toBeLessThan(TYPICAL_SITE_BUDGET_MS)
})

test('The binary prints a large site within budget', async () => {
  const { result, duration } = await timed(() =>
    execa(
      'node',
      [BINARY_PATH, `--repositoryRoot=${root}`, `--branch=${LARGE_SITE_BRANCH}`, `--context=${LARGE_SITE_CONTEXT}`],
      { cwd: root, env: { NETLIFY_AUTH_TOKEN: '' } },
    ),
  )

  expect(duration).toBeLessThan(BINARY_BUDGET_MS)
  const { context, config } = asConfig(JSON.parse(result.stdout))
  expect(context).toBe(LARGE_SITE_CONTEXT)
  expect(config['redirects']).toHaveLength(SITE_SIZE.fileRedirects + SITE_SIZE.configRedirects)
  expect(config['headers']).toHaveLength(SITE_SIZE.fileHeaders + SITE_SIZE.configHeaders)
})
