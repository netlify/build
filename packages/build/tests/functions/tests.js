import { readdir, rm, stat, writeFile } from 'fs/promises'
import { sep } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, removeDir, getTempName } from '@netlify/testing'
import test from 'ava'
import { pathExists } from 'path-exists'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('Functions: missing source directory', async (t) => {
  const output = await new Fixture('./fixtures/missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: must not be a regular file', async (t) => {
  const output = await new Fixture('./fixtures/regular_file').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: can be a symbolic link', async (t) => {
  const output = await new Fixture('./fixtures/symlink').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: default directory', async (t) => {
  const output = await new Fixture('./fixtures/default').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: simple setup', async (t) => {
  await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  const output = await new Fixture('./fixtures/simple').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: no functions', async (t) => {
  const output = await new Fixture('./fixtures/none').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: invalid package.json', async (t) => {
  const packageJsonPath = `${FIXTURES_DIR}/functions_package_json_invalid/package.json`
  // We need to create that file during tests. Otherwise, ESLint fails when
  // detecting an invalid *.json file.
  await writeFile(packageJsonPath, '{{}')
  try {
    const output = await new Fixture('./fixtures/functions_package_json_invalid').runWithBuild()
    // This shape of this error can change with different Node.js versions.
    t.true(output.includes('in JSON at position 1'))
  } finally {
    await rm(packageJsonPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Functions: --functionsDistDir', async (t) => {
  const functionsDistDir = await getTempName()
  try {
    const output = await new Fixture('./fixtures/simple')
      .withFlags({ mode: 'buildbot', functionsDistDir })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
    t.true(await pathExists(functionsDistDir))
    const files = await readdir(functionsDistDir)
    // We're expecting two files: the function ZIP and the manifest.
    t.is(files.length, 2)
  } finally {
    await removeDir(functionsDistDir)
  }
})

test('Functions: custom path on scheduled function', async (t) => {
  const output = await new Fixture('./fixtures/custom_path_scheduled').runWithBuild()
  t.true(output.includes('Scheduled functions must not specify a custom path.'))
})

test('Functions: custom path on event-triggered function', async (t) => {
  const output = await new Fixture('./fixtures/custom_path_event_triggered').runWithBuild()
  t.true(output.includes('Event-triggered functions must not specify a custom path.'))
})

test('Functions: internal functions are cleared on the dev timeline', async (t) => {
  const fixture = await new Fixture('./fixtures/internal_functions')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()
  const output = await fixture.runDev(() => {})

  await t.throwsAsync(() => stat(`${fixture.repositoryRoot}/.netlify/functions-internal/`), { code: 'ENOENT' })
  await t.throwsAsync(() => stat(`${fixture.repositoryRoot}/.netlify/edge-functions/`), { code: 'ENOENT' })

  t.true(output.includes('Cleaning up leftover files from previous builds'))
  t.true(output.includes(`Cleaned up .netlify${sep}functions-internal, .netlify${sep}edge-functions`))
})

test('Functions: cleanup is only triggered when there are internal functions', async (t) => {
  const fixture = await new Fixture('./fixtures/internal_functions')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  await rm(`${fixture.repositoryRoot}/.netlify/functions-internal/`, { force: true, recursive: true })
  await rm(`${fixture.repositoryRoot}/.netlify/edge-functions/`, { force: true, recursive: true })

  const output = await fixture.runDev(() => {})
  t.false(output.includes('Cleaning up leftover files from previous builds'))
})
