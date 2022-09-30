import { promises as fs } from 'fs'
import { platform } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, startTcpServer } from '@netlify/testing'
import test from 'ava'
import del from 'del'
import { pathExists } from 'path-exists'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

const startDeployServer = function (opts = {}) {
  const useUnixSocket = platform !== 'win32'
  return startTcpServer({ useUnixSocket, response: { succeeded: true, ...opts.response }, ...opts })
}

test('--saveConfig deletes headers file if headers were changed', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/save_headers`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureHeadersPath = `${fixtureDir}/_headers_file`
  const headersPath = `${fixtureDir}/_headers`
  await Promise.all([fs.copyFile(fixtureConfigPath, configPath), fs.copyFile(fixtureHeadersPath, headersPath)])
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const output = await new Fixture('./fixtures/save_headers')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runWithBuild()
      t.snapshot(normalizeOutput(output))
    } finally {
      await stopServer()
    }
  } finally {
    await del(headersPath)
  }
})

test('--saveConfig deletes headers file if any configuration property was changed', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/delete_headers`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureHeadersPath = `${fixtureDir}/_headers_file`
  const headersPath = `${fixtureDir}/_headers`
  await Promise.all([fs.copyFile(fixtureConfigPath, configPath), fs.copyFile(fixtureHeadersPath, headersPath)])
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const output = await new Fixture('./fixtures/delete_headers')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runWithBuild()
      t.snapshot(normalizeOutput(output))
    } finally {
      await stopServer()
    }
  } finally {
    await del(headersPath)
  }
})

test('Erroneous headers created by a build command are handled', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/headers_command_error`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const headersPath = `${fixtureDir}/_headers`
  await fs.copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const { output } = await new Fixture('./fixtures/headers_command_error')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runBuildBinary()
      t.snapshot(normalizeOutput(output))
    } finally {
      await stopServer()
    }
  } finally {
    await del(headersPath)
  }
})

test('Erroneous headers created by a plugin are handled', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/headers_plugin_error`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const headersPath = `${fixtureDir}/_headers`
  await fs.copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const { output } = await new Fixture('./fixtures/headers_plugin_error')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runBuildBinary()
      t.snapshot(normalizeOutput(output))
    } finally {
      await stopServer()
    }
  } finally {
    await del(headersPath)
  }
})

test('--saveConfig deletes redirects file if redirects were changed', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/save_redirects`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureRedirectsPath = `${fixtureDir}/_redirects_file`
  const redirectsPath = `${fixtureDir}/_redirects`
  await Promise.all([fs.copyFile(fixtureConfigPath, configPath), fs.copyFile(fixtureRedirectsPath, redirectsPath)])
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const output = await new Fixture('./fixtures/save_redirects')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runWithBuild()
      t.snapshot(normalizeOutput(output))
    } finally {
      await stopServer()
    }
  } finally {
    await del(redirectsPath)
  }
})

test('--saveConfig deletes redirects file if any configuration property was changed', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/delete_redirects`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  const fixtureRedirectsPath = `${fixtureDir}/_redirects_file`
  const redirectsPath = `${fixtureDir}/_redirects`
  await Promise.all([fs.copyFile(fixtureConfigPath, configPath), fs.copyFile(fixtureRedirectsPath, redirectsPath)])
  const { address, stopServer } = await startDeployServer()
  try {
    try {
      const output = await new Fixture('./fixtures/delete_redirects')
        .withFlags({
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        })
        .runWithBuild()
      t.snapshot(normalizeOutput(output))
    } finally {
      await stopServer()
    }
  } finally {
    await del(redirectsPath)
  }
})

test('--saveConfig saves the configuration changes as netlify.toml', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/save_changes`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await fs.copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture('./fixtures/save_changes')
      .withFlags({
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
})

test('--saveConfig does not truncate high amount of redirects', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/many_redirects`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await fs.copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer({
    async onRequest() {
      const newConfigContents = await fs.readFile(configPath, 'utf8')
      t.true(newConfigContents.includes('999'))
    },
  })
  try {
    await new Fixture('./fixtures/many_redirects')
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

test('--saveConfig does not truncate high amount of headers', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/many_headers`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await fs.copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer({
    async onRequest() {
      const newConfigContents = await fs.readFile(configPath, 'utf8')
      t.true(newConfigContents.includes('999'))
    },
  })
  try {
    await new Fixture('./fixtures/many_headers')
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

test('--saveConfig is required to save the configuration changes as netlify.toml', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/save_none`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await fs.copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture('./fixtures/save_none')
      .withFlags({ buildbotServerSocket: address, config: configPath, context: 'production', branch: 'main' })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
})

test('--saveConfig creates netlify.toml if it does not exist', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/save_empty`
  const configPath = `${fixtureDir}/netlify.toml`
  await del(configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture('./fixtures/save_empty')
      .withFlags({
        buildbotServerSocket: address,
        saveConfig: true,
        context: 'production',
        branch: 'main',
        defaultConfig: { plugins: [{ package: './plugin.js' }] },
      })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
    t.false(await pathExists(configPath))
  } finally {
    await stopServer()
  }
})

test('--saveConfig gives higher priority to configuration changes than context properties', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/save_context`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await fs.copyFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture('./fixtures/save_context')
      .withFlags({
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
})

test('--saveConfig is performed before deploy', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/save_deploy`
  const configPath = `${fixtureDir}/netlify.toml`
  await del(configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture('./fixtures/save_deploy')
      .withFlags({
        buildbotServerSocket: address,
        saveConfig: true,
        context: 'production',
        branch: 'main',
        defaultConfig: { plugins: [{ package: './plugin.js' }] },
      })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
})
