import { Fixture } from '@netlify/testing'
import { beforeEach, expect, test } from 'vitest'

// Mock fetch for external extension installation requests
const originalFetch = globalThis.fetch
const mockInstallationResponse = { success: true, mocked: true, testId: 'MOCK_RESPONSE_12345' }

// Track installation requests for testing
let installationRequests = []

const mockFetch = async (url, options) => {
  // Convert URL object to string if needed
  const urlString = url.toString()

  // If it's an installation request to an external extension URL
  if (urlString.includes('/.netlify/functions/handler/on-install')) {
    installationRequests.push({ url: urlString, options })
    return {
      ok: true,
      status: 200,
      json: async () => mockInstallationResponse,
      text: async () => JSON.stringify(mockInstallationResponse),
    }
  }

  // If it's a request to the extension API for auto-installable extensions
  if (urlString.includes('api.netlifysdk.com/meta/auto-installable')) {
    return {
      ok: true,
      status: 200,
      json: async () => AUTO_INSTALLABLE_EXTENSIONS_RESPONSE.response,
      text: async () => JSON.stringify(AUTO_INSTALLABLE_EXTENSIONS_RESPONSE.response),
    }
  }

  // For all other requests, use the original fetch
  return originalFetch(url, options)
}

// Set up global fetch mock
globalThis.fetch = mockFetch

// Reset installation requests before each test
beforeEach(() => {
  installationRequests = []
})

const SITE_INFO_DATA = {
  path: '/api/v1/sites/test',
  response: { id: 'test', name: 'test' },
}

const TEAM_INSTALLATIONS_META_RESPONSE = {
  path: '/team/account1/integrations/installations/meta/test',
  response: [],
}

const FETCH_EXTENSIONS_EMPTY_RESPONSE = {
  path: '/integrations',
  response: [],
}

// Mock response for auto-installable extensions API
const AUTO_INSTALLABLE_EXTENSIONS_RESPONSE = {
  path: '/meta/auto-installable',
  response: [
    {
      slug: 'neon',
      hostSiteUrl: 'https://neon-extension.netlify.app', // Mocked by fetch mock
      packages: ['@netlify/neon'],
    },
  ],
}

test('Auto-install extensions: feature flag disabled returns extensions unchanged', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/with_neon_package')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions_v2: false,
      },
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  // Should not have attempted to install any extensions
  expect(output.includes('Installing extension')).toBe(false)
  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(0)
})

test('Auto-install extensions: gracefully handles missing package.json', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/no_package_json')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions_v2: true,
      },
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  // Should not have attempted to install any extensions
  expect(output.includes('Installing extension')).toBe(false)
  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(0)
})

test('Auto-install extensions: correctly reads package.json from buildDir', async () => {
  // This test verifies that the function correctly reads package.json from buildDir
  const { output } = await new Fixture(import.meta.url, './fixtures/with_neon_package')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions_v2: true,
      },
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  // Should have found package.json in buildDir
  expect(config.integrations).toBeTruthy()
  expect(config.buildDir).toBeTruthy()
  expect(config.buildDir.includes('with_neon_package')).toBe(true)

  // Auto-installable extensions API call is mocked by global fetch mock
  // (not visible in requests array since it's intercepted before reaching test server)

  // Should have attempted to install the extension (mocked)
  expect(installationRequests.length > 0, 'Should have attempted to install extension').toBeTruthy()
  expect(
    installationRequests[0].url.includes('/.netlify/functions/handler/on-install'),
    'Should have called installation endpoint',
  ).toBeTruthy()
  expect(
    installationRequests[0].url.includes('neon-extension.netlify.app'),
    'Should have called correct external URL',
  ).toBeTruthy()
  expect(installationRequests[0].options.method === 'POST', 'Should use POST method').toBeTruthy()
  expect(
    installationRequests[0].options.body.includes('account1'),
    'Should include team ID in request body',
  ).toBeTruthy()
})

test('Auto-install extensions: does not install when required packages are missing', async () => {
  // This test uses a fixture that has dependencies but not the extension packages
  const { output } = await new Fixture(import.meta.url, './fixtures/without_packages')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions_v2: true,
      },
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  // Should not attempt to install extensions since required packages are missing
  expect(output.includes('Installing extension')).toBe(false)
  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(0)

  // Auto-installable extensions API call is mocked by global fetch mock
  // (not visible in requests array since it's intercepted before reaching test server)
})

test('Auto-install extensions: correctly reads package.json when no netlify.toml exists', async () => {
  // This test verifies buildDir resolution works correctly when there's no netlify.toml
  // but package.json exists with extension packages
  const { output } = await new Fixture(import.meta.url, './fixtures/no_netlify_toml_with_neon')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions_v2: true,
      },
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  // Should have found package.json in buildDir even without netlify.toml
  expect(config.integrations).toBeTruthy()
  expect(config.buildDir).toBeTruthy()
  expect(config.buildDir.includes('no_netlify_toml_with_neon')).toBe(true)

  // buildDir should be the repository root since there's no build.base config
  expect(config.buildDir.endsWith('no_netlify_toml_with_neon')).toBe(true)

  // Auto-installable extensions API call is mocked by global fetch mock
  // (not visible in requests array since it's intercepted before reaching test server)

  // Should have attempted to install the extension
  expect(installationRequests.length > 0, 'Should have attempted to install extension').toBeTruthy()
  expect(
    installationRequests[0].url.includes('/.netlify/functions/handler/on-install'),
    'Should have called installation endpoint',
  ).toBeTruthy()
})
