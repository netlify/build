import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('Context with context CLI flag', async (t) => {
  const output = await new Fixture('./fixtures/context_flag').withFlags({ context: 'testContext' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context environment variable', async (t) => {
  const output = await new Fixture('./fixtures/context_flag').withEnv({ CONTEXT: 'testContext' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context default value', async (t) => {
  const output = await new Fixture('./fixtures/context_default').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context with branch CLI flag', async (t) => {
  const output = await new Fixture('./fixtures/branch').withFlags({ branch: 'testBranch' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context with branch environment variable', async (t) => {
  const output = await new Fixture('./fixtures/branch')
    .withFlags({ branch: '' })
    .withEnv({ BRANCH: 'testBranch' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context with branch git', async (t) => {
  const output = await new Fixture('./fixtures/branch')
    .withFlags({ branch: '' })
    .withCopyRoot({ branch: 'testBranch' })
    .then((fixture) => fixture.runWithConfig())
  t.snapshot(normalizeOutput(output))
})

test('Context with branch fallback', async (t) => {
  const output = await new Fixture('./fixtures/branch_fallback')
    .withFlags({ branch: '' })
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithConfig())
  t.snapshot(normalizeOutput(output))
})

test('Context deep merge', async (t) => {
  const output = await new Fixture('./fixtures/deep_merge').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context array merge', async (t) => {
  const output = await new Fixture('./fixtures/array_merge').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context merge priority', async (t) => {
  const output = await new Fixture('./fixtures/priority_merge').withFlags({ branch: 'testBranch' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Using context does not reset plugins', async (t) => {
  const output = await new Fixture('./fixtures/context_reset').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Can use context properties for build.edge_functions', async (t) => {
  const output = await new Fixture('./fixtures/context_edge_functions_build').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Can use context properties for edge_functions', async (t) => {
  const output = await new Fixture('./fixtures/context_edge_functions_top').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context with branch wildcard pattern', async (t) => {
  const output = await new Fixture('./fixtures/branch_wildcard').withFlags({ branch: 'feat/test-wildcard' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Context with branch exact match takes precedence over wildcard', async (t) => {
  const output = await new Fixture('./fixtures/branch_wildcard').withFlags({ branch: 'feat/special' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})
