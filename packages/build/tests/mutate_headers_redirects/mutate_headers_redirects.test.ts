import { rm } from 'fs/promises'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('netlifyConfig is updated when headers file is created by a plugin', async () => {
  const headersFile = `${FIXTURES_DIR}/headers_plugin/_headers`
  await rm(headersFile, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/headers_plugin').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(headersFile, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig is updated when headers file is created by a plugin and publish was changed', async () => {
  const headersFile = `${FIXTURES_DIR}/headers_plugin_dynamic/test/_headers`
  await rm(headersFile, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/headers_plugin_dynamic').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(headersFile, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig is updated when headers file is created by a build command', async () => {
  const headersFile = `${FIXTURES_DIR}/headers_command/_headers`
  await rm(headersFile, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/headers_command').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(headersFile, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig is updated when headers file is created by a build command and publish was changed', async () => {
  const headersFile = `${FIXTURES_DIR}/headers_command_dynamic/test/_headers`
  await rm(headersFile, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/headers_command_dynamic').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(headersFile, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig is updated when redirects file is created by a plugin', async () => {
  const redirectsFile = `${FIXTURES_DIR}/redirects_plugin/_redirects`
  await rm(redirectsFile, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/redirects_plugin').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(redirectsFile, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig is updated when redirects file is created by a plugin and publish was changed', async () => {
  const redirectsFile = `${FIXTURES_DIR}/redirects_plugin_dynamic/test/_redirects`
  await rm(redirectsFile, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/redirects_plugin_dynamic').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(redirectsFile, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig is updated when redirects file is created by a build command', async () => {
  const redirectsFile = `${FIXTURES_DIR}/redirects_command/_redirects`
  await rm(redirectsFile, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/redirects_command').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(redirectsFile, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig is updated when redirects file is created by a build command and publish was changed', async () => {
  const redirectsFile = `${FIXTURES_DIR}/redirects_command_dynamic/test/_redirects`
  await rm(redirectsFile, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/redirects_command_dynamic').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(redirectsFile, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig.headers can be assigned all at once', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_all').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('netlifyConfig.headers can be modified before headers file has been added', async () => {
  const headersPath = `${FIXTURES_DIR}/headers_before/_headers`
  await rm(headersPath, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/headers_before').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(headersPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig.headers can be modified after headers file has been added', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_after').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('netlifyConfig.redirects can be assigned all at once', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_all').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('netlifyConfig.redirects can be modified before redirects file has been added', async () => {
  const redirectsPath = `${FIXTURES_DIR}/redirects_before/_redirects`
  await rm(redirectsPath, { force: true, recursive: true, maxRetries: 10 })
  try {
    const output = await new Fixture(import.meta.url, './fixtures/redirects_before').runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await rm(redirectsPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('netlifyConfig.redirects can be modified after redirects file has been added', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_after').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
