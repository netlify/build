import { Fixture } from '@netlify/testing'
import test from 'ava'

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

  // For all other requests, use the original fetch
  return originalFetch(url, options)
}

// Set up global fetch mock
globalThis.fetch = mockFetch

// Reset installation requests before each test
test.beforeEach(() => {
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

const FETCH_INTEGRATIONS_EMPTY_RESPONSE = {
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

test('Auto-install extensions: feature flag disabled returns integrations unchanged', async (t) => {
  const { output } = await new Fixture('./fixtures/with_neon_package')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions: false,
      },
    })
    .runConfigServer([
      SITE_INFO_DATA,
      TEAM_INSTALLATIONS_META_RESPONSE,
      FETCH_INTEGRATIONS_EMPTY_RESPONSE,
      AUTO_INSTALLABLE_EXTENSIONS_RESPONSE,
    ])

  const config = JSON.parse(output)

  // Should not have attempted to install any extensions
  t.false(output.includes('Installing extension'))
  t.assert(config.integrations)
  t.is(config.integrations.length, 0)
})

test('Auto-install extensions: gracefully handles missing package.json', async (t) => {
  const { output } = await new Fixture('./fixtures/no_package_json')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions: true,
      },
    })
    .runConfigServer([
      SITE_INFO_DATA,
      TEAM_INSTALLATIONS_META_RESPONSE,
      FETCH_INTEGRATIONS_EMPTY_RESPONSE,
      AUTO_INSTALLABLE_EXTENSIONS_RESPONSE,
    ])

  const config = JSON.parse(output)

  // Should not have attempted to install any extensions
  t.false(output.includes('Installing extension'))
  t.assert(config.integrations)
  t.is(config.integrations.length, 0)
})

test('Auto-install extensions: correctly reads package.json from buildDir', async (t) => {
  // This test verifies that the function correctly reads package.json from buildDir
  const { output, requests } = await new Fixture('./fixtures/with_neon_package')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions: true,
      },
    })
    .runConfigServer([
      SITE_INFO_DATA,
      TEAM_INSTALLATIONS_META_RESPONSE,
      FETCH_INTEGRATIONS_EMPTY_RESPONSE,
      AUTO_INSTALLABLE_EXTENSIONS_RESPONSE,
    ])

  const config = JSON.parse(output)

  // Should have found package.json in buildDir
  t.assert(config.integrations)
  t.assert(config.buildDir)
  t.true(config.buildDir.includes('with_neon_package'))

  // Should have made a request to fetch auto-installable extensions
  const autoInstallRequest = requests.find((request) => request.url.includes('/meta/auto-installable'))
  t.assert(autoInstallRequest, 'Should have fetched auto-installable extensions')

  // Should have attempted to install the extension (mocked)
  t.assert(installationRequests.length > 0, 'Should have attempted to install extension')
  t.assert(
    installationRequests[0].url.includes('/.netlify/functions/handler/on-install'),
    'Should have called installation endpoint',
  )
  t.assert(
    installationRequests[0].url.includes('neon-extension.netlify.app'),
    'Should have called correct external URL',
  )
  t.assert(installationRequests[0].options.method === 'POST', 'Should use POST method')
  t.assert(installationRequests[0].options.body.includes('account1'), 'Should include team ID in request body')
})

test('Auto-install extensions: does not install when required packages are missing', async (t) => {
  // This test uses a fixture that has dependencies but not the extension packages
  const { output, requests } = await new Fixture('./fixtures/without_packages')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions: true,
      },
    })
    .runConfigServer([
      SITE_INFO_DATA,
      TEAM_INSTALLATIONS_META_RESPONSE,
      FETCH_INTEGRATIONS_EMPTY_RESPONSE,
      AUTO_INSTALLABLE_EXTENSIONS_RESPONSE,
    ])

  const config = JSON.parse(output)

  // Should not attempt to install extensions since required packages are missing
  t.false(output.includes('Installing extension'))
  t.assert(config.integrations)
  t.is(config.integrations.length, 0)

  // Should have made a request to fetch auto-installable extensions
  const autoInstallRequest = requests.find((request) => request.url.includes('/meta/auto-installable'))
  t.assert(autoInstallRequest, 'Should have fetched auto-installable extensions')
})

test('Auto-install extensions: correctly reads package.json when no netlify.toml exists', async (t) => {
  // This test verifies buildDir resolution works correctly when there's no netlify.toml
  // but package.json exists with extension packages
  const { output, requests } = await new Fixture('./fixtures/no_netlify_toml_with_neon')
    .withFlags({
      siteId: 'test',
      accountId: 'account1',
      token: 'test',
      mode: 'dev',
      featureFlags: {
        auto_install_required_extensions: true,
      },
    })
    .runConfigServer([
      SITE_INFO_DATA,
      TEAM_INSTALLATIONS_META_RESPONSE,
      FETCH_INTEGRATIONS_EMPTY_RESPONSE,
      AUTO_INSTALLABLE_EXTENSIONS_RESPONSE,
    ])

  const config = JSON.parse(output)

  // Should have found package.json in buildDir even without netlify.toml
  t.assert(config.integrations)
  t.assert(config.buildDir)
  t.true(config.buildDir.includes('no_netlify_toml_with_neon'))

  // buildDir should be the repository root since there's no build.base config
  t.true(config.buildDir.endsWith('no_netlify_toml_with_neon'))

  // Should have made a request to fetch auto-installable extensions
  const autoInstallRequest = requests.find((request) => request.url.includes('/meta/auto-installable'))
  t.assert(autoInstallRequest, 'Should have fetched auto-installable extensions')

  // Should have attempted to install the extension
  t.assert(installationRequests.length > 0, 'Should have attempted to install extension')
  t.assert(
    installationRequests[0].url.includes('/.netlify/functions/handler/on-install'),
    'Should have called installation endpoint',
  )
})
