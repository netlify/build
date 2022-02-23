import { promises as fs } from 'fs'
import { platform } from 'process'

import test from 'ava'
import del from 'del'
import { pathExists } from 'path-exists'

import { runFixture, FIXTURES_DIR } from '../helpers/main.js'
import { startTcpServer } from '../helpers/tcp_server.js'

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
      await runFixture(t, 'save_headers', {
        flags: {
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        },
      })
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
      await runFixture(t, 'delete_headers', {
        flags: {
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        },
      })
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
      await runFixture(t, 'headers_command_error', {
        flags: {
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        },
        useBinary: true,
      })
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
      await runFixture(t, 'headers_plugin_error', {
        flags: {
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        },
        useBinary: true,
      })
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
      await runFixture(t, 'save_redirects', {
        flags: {
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        },
      })
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
      await runFixture(t, 'delete_redirects', {
        flags: {
          buildbotServerSocket: address,
          config: configPath,
          saveConfig: true,
          context: 'production',
          branch: 'main',
        },
      })
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
    await runFixture(t, 'save_changes', {
      flags: {
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      },
    })
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
    await runFixture(t, 'many_redirects', {
      flags: {
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      },
      snapshot: false,
    })
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
    await runFixture(t, 'many_headers', {
      flags: {
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      },
      snapshot: false,
    })
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
    await runFixture(t, 'save_none', {
      flags: { buildbotServerSocket: address, config: configPath, context: 'production', branch: 'main' },
    })
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
    await runFixture(t, 'save_empty', {
      flags: {
        buildbotServerSocket: address,
        saveConfig: true,
        context: 'production',
        branch: 'main',
        defaultConfig: { plugins: [{ package: './plugin.js' }] },
      },
    })
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
    await runFixture(t, 'save_context', {
      flags: {
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      },
    })
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
    await runFixture(t, 'save_deploy', {
      flags: {
        buildbotServerSocket: address,
        saveConfig: true,
        context: 'production',
        branch: 'main',
        defaultConfig: { plugins: [{ package: './plugin.js' }] },
      },
    })
  } finally {
    await stopServer()
  }
})
