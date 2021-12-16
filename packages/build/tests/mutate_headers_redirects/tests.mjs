import test from 'ava'
import del from 'del'

import { runFixture, FIXTURES_DIR } from '../helpers/main.js'

test('netlifyConfig is updated when headers file is created by a plugin', async (t) => {
  const headersFile = `${FIXTURES_DIR}/headers_plugin/_headers`
  await del(headersFile)
  try {
    await runFixture(t, 'headers_plugin')
  } finally {
    await del(headersFile)
  }
})

test('netlifyConfig is updated when headers file is created by a plugin and publish was changed', async (t) => {
  const headersFile = `${FIXTURES_DIR}/headers_plugin_dynamic/test/_headers`
  await del(headersFile)
  try {
    await runFixture(t, 'headers_plugin_dynamic')
  } finally {
    await del(headersFile)
  }
})

test('netlifyConfig is updated when headers file is created by a build command', async (t) => {
  const headersFile = `${FIXTURES_DIR}/headers_command/_headers`
  await del(headersFile)
  try {
    await runFixture(t, 'headers_command')
  } finally {
    await del(headersFile)
  }
})

test('netlifyConfig is updated when headers file is created by a build command and publish was changed', async (t) => {
  const headersFile = `${FIXTURES_DIR}/headers_command_dynamic/test/_headers`
  await del(headersFile)
  try {
    await runFixture(t, 'headers_command_dynamic')
  } finally {
    await del(headersFile)
  }
})

test('netlifyConfig is updated when redirects file is created by a plugin', async (t) => {
  const redirectsFile = `${FIXTURES_DIR}/redirects_plugin/_redirects`
  await del(redirectsFile)
  try {
    await runFixture(t, 'redirects_plugin')
  } finally {
    await del(redirectsFile)
  }
})

test('netlifyConfig is updated when redirects file is created by a plugin and publish was changed', async (t) => {
  const redirectsFile = `${FIXTURES_DIR}/redirects_plugin_dynamic/test/_redirects`
  await del(redirectsFile)
  try {
    await runFixture(t, 'redirects_plugin_dynamic')
  } finally {
    await del(redirectsFile)
  }
})

test('netlifyConfig is updated when redirects file is created by a build command', async (t) => {
  const redirectsFile = `${FIXTURES_DIR}/redirects_command/_redirects`
  await del(redirectsFile)
  try {
    await runFixture(t, 'redirects_command')
  } finally {
    await del(redirectsFile)
  }
})

test('netlifyConfig is updated when redirects file is created by a build command and publish was changed', async (t) => {
  const redirectsFile = `${FIXTURES_DIR}/redirects_command_dynamic/test/_redirects`
  await del(redirectsFile)
  try {
    await runFixture(t, 'redirects_command_dynamic')
  } finally {
    await del(redirectsFile)
  }
})

test('netlifyConfig.headers can be assigned all at once', async (t) => {
  await runFixture(t, 'headers_all')
})

test('netlifyConfig.headers can be modified before headers file has been added', async (t) => {
  const headersPath = `${FIXTURES_DIR}/headers_before/_headers`
  await del(headersPath)
  try {
    await runFixture(t, 'headers_before')
  } finally {
    await del(headersPath)
  }
})

test('netlifyConfig.headers can be modified after headers file has been added', async (t) => {
  await runFixture(t, 'headers_after')
})

test('netlifyConfig.redirects can be assigned all at once', async (t) => {
  await runFixture(t, 'redirects_all')
})

test('netlifyConfig.redirects can be modified before redirects file has been added', async (t) => {
  const redirectsPath = `${FIXTURES_DIR}/redirects_before/_redirects`
  await del(redirectsPath)
  try {
    await runFixture(t, 'redirects_before')
  } finally {
    await del(redirectsPath)
  }
})

test('netlifyConfig.redirects can be modified after redirects file has been added', async (t) => {
  await runFixture(t, 'redirects_after')
})
