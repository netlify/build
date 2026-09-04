import { existsSync } from 'fs'
import { copyFile, readFile, rm } from 'fs/promises'
import { platform } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, startTcpServer } from '@netlify/testing'
import { expect, test } from 'vitest'
import tmp from 'tmp-promise'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

const startDeployServer = function (opts: { onRequest?: () => Promise<void> } = {}) {
  const useUnixSocket = platform !== 'win32'
  return startTcpServer({ useUnixSocket, response: { succeeded: true }, ...opts })
}

test('--saveConfig deletes headers file if headers were changed', async () => {
  const fixtureDir = `${FIXTURES_DIR}/save_headers`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureHeadersPath = `${fixtureDir}/_headers_file`
  const headersPath = `${fixtureDir}/_headers`
  await Promise.all([copyFile(fixtureConfigPath, configPath), copyFile(fixtureHeadersPath, headersPath)])
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const output = await new Fixture(import.meta.url, './fixtures/save_headers')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runWithBuild()
      expect(normalizeOutput(output)).toMatchSnapshot()
    } finally {
      await stopServer()
    }
  } finally {
    await rm(headersPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('--saveConfig deletes headers file if any configuration property was changed', async () => {
  const fixtureDir = `${FIXTURES_DIR}/delete_headers`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureHeadersPath = `${fixtureDir}/_headers_file`
  const headersPath = `${fixtureDir}/_headers`
  await Promise.all([copyFile(fixtureConfigPath, configPath), copyFile(fixtureHeadersPath, headersPath)])
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const output = await new Fixture(import.meta.url, './fixtures/delete_headers')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runWithBuild()
      expect(normalizeOutput(output)).toMatchSnapshot()
    } finally {
      await stopServer()
    }
  } finally {
    await rm(headersPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Erroneous headers created by a build command are handled', async () => {
  const fixtureDir = `${FIXTURES_DIR}/headers_command_error`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const headersPath = `${fixtureDir}/_headers`
  await copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const { output } = await new Fixture(import.meta.url, './fixtures/headers_command_error')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runBuildBinary()
      expect(output).toContain('Warning: some headers have syntax errors')
    } finally {
      await stopServer()
    }
  } finally {
    await rm(headersPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Erroneous headers created by a plugin are handled', async () => {
  const fixtureDir = `${FIXTURES_DIR}/headers_plugin_error`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const headersPath = `${fixtureDir}/_headers`
  await copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const { output } = await new Fixture(import.meta.url, './fixtures/headers_plugin_error')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runBuildBinary()
      expect(normalizeOutput(output)).toMatchSnapshot()
    } finally {
      await stopServer()
    }
  } finally {
    await rm(headersPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('--saveConfig deletes redirects file if redirects were changed', async () => {
  const fixtureDir = `${FIXTURES_DIR}/save_redirects`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureRedirectsPath = `${fixtureDir}/_redirects_file`
  const redirectsPath = `${fixtureDir}/_redirects`
  await Promise.all([copyFile(fixtureConfigPath, configPath), copyFile(fixtureRedirectsPath, redirectsPath)])
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const output = await new Fixture(import.meta.url, './fixtures/save_redirects')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runWithBuild()
      expect(normalizeOutput(output)).toMatchSnapshot()
    } finally {
      await stopServer()
    }
  } finally {
    await rm(redirectsPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('--saveConfig deletes redirects file if any configuration property was changed', async () => {
  const fixtureDir = `${FIXTURES_DIR}/delete_redirects`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureRedirectsPath = `${fixtureDir}/_redirects_file`
  const redirectsPath = `${fixtureDir}/_redirects`
  await Promise.all([copyFile(fixtureConfigPath, configPath), copyFile(fixtureRedirectsPath, redirectsPath)])
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const output = await new Fixture(import.meta.url, './fixtures/delete_redirects')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runWithBuild()
      expect(normalizeOutput(output)).toMatchSnapshot()
    } finally {
      await stopServer()
    }
  } finally {
    await rm(redirectsPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('--saveConfig saves the configuration changes as netlify.toml', async () => {
  const fixtureDir = `${FIXTURES_DIR}/save_changes`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture(import.meta.url, './fixtures/save_changes')
      .withFlags({
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await stopServer()
  }
})

test('--saveConfig does not truncate high amount of redirects', async () => {
  const fixtureDir = `${FIXTURES_DIR}/many_redirects`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer({
    async onRequest() {
      const newConfigContents = await readFile(configPath, 'utf8')
      expect(newConfigContents).toContain('999')
    },
  })
  try {
    await new Fixture(import.meta.url, './fixtures/many_redirects')
      .withFlags({
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      })
      .runWithBuild()
  } finally {
    await stopServer()
  }
})

test('--saveConfig does not truncate high amount of headers', async () => {
  const fixtureDir = `${FIXTURES_DIR}/many_headers`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer({
    async onRequest() {
      const newConfigContents = await readFile(configPath, 'utf8')
      expect(newConfigContents).toContain('999')
    },
  })
  try {
    await new Fixture(import.meta.url, './fixtures/many_headers')
      .withFlags({
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      })
      .runWithBuild()
  } finally {
    await stopServer()
  }
})

test('--saveConfig is required to save the configuration changes as netlify.toml', async () => {
  const fixtureDir = `${FIXTURES_DIR}/save_none`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture(import.meta.url, './fixtures/save_none')
      .withFlags({ buildbotServerSocket: address, config: configPath, context: 'production', branch: 'main' })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await stopServer()
  }
})

test('--saveConfig creates netlify.toml if it does not exist', async () => {
  const fixtureDir = `${FIXTURES_DIR}/save_empty`
  const configPath = `${fixtureDir}/netlify.toml`

  await rm(configPath, { force: true, recursive: true, maxRetries: 10 })

  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture(import.meta.url, './fixtures/save_empty')
      .withFlags({
        buildbotServerSocket: address,
        saveConfig: true,
        context: 'production',
        branch: 'main',
        defaultConfig: { plugins: [{ package: './plugin.js' }] },
      })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
    expect(existsSync(configPath)).toBe(false)
  } finally {
    await stopServer()
  }
})

test('--saveConfig gives higher priority to configuration changes than context properties', async () => {
  const fixtureDir = `${FIXTURES_DIR}/save_context`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture(import.meta.url, './fixtures/save_context')
      .withFlags({
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await stopServer()
  }
})

test('--saveConfig is performed before deploy', async () => {
  const fixtureDir = `${FIXTURES_DIR}/save_deploy`
  const configPath = `${fixtureDir}/netlify.toml`

  await rm(configPath, { force: true, recursive: true, maxRetries: 10 })

  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture(import.meta.url, './fixtures/save_deploy')
      .withFlags({
        buildbotServerSocket: address,
        saveConfig: true,
        context: 'production',
        branch: 'main',
        defaultConfig: { plugins: [{ package: './plugin.js' }] },
      })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await stopServer()
  }
})

test('--saveConfig writes the mutated config to the path in --outputConfigPath', async () => {
  const fixtureDir = `${FIXTURES_DIR}/save_changes`
  const configPath = `${fixtureDir}/netlify.toml`
  const configBeforeBuild = await readFile(configPath, 'utf8')
  const tempConfig = await tmp.file()
  const output = await new Fixture(import.meta.url, './fixtures/save_changes')
    .withFlags({
      saveConfig: true,
      outputConfigPath: tempConfig.path,
      context: 'production',
      branch: 'main',
      defaultConfig: { plugins: [{ package: './plugin.js' }] },
    })
    .runWithBuild()

  expect(normalizeOutput(output)).toMatchSnapshot()

  const configAfterBuild = await readFile(configPath, 'utf8')
  const mutatedConfig = await readFile(tempConfig.path, 'utf8')

  await tempConfig.cleanup()

  expect(configAfterBuild).toBe(configBeforeBuild)
  expect(mutatedConfig).toContain('command = "node --version"')
})
