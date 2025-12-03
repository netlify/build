import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

import { buildErrorToTracingAttributes } from '../../lib/error/types.js'

test('exception', async (t) => {
  const output = await new Fixture('./fixtures/exception').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('exception with static properties', async (t) => {
  const output = await new Fixture('./fixtures/exception_props').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('exception with circular references', async (t) => {
  const output = await new Fixture('./fixtures/exception_circular').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('exception that are strings', async (t) => {
  const output = await new Fixture('./fixtures/exception_string').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('exception that are arrays', async (t) => {
  const output = await new Fixture('./fixtures/exception_array').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Do not log secret values on build errors', async (t) => {
  const output = await new Fixture('./fixtures/log_secret').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('TOML parsing errors', async (t) => {
  const output = await new Fixture('./fixtures/toml_parsing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Invalid error instances', async (t) => {
  const output = await new Fixture('./fixtures/invalid_instance').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Top-level errors', async (t) => {
  const output = await new Fixture('./fixtures/top').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Top function errors local', async (t) => {
  const output = await new Fixture('./fixtures/function').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Node module all fields', async (t) => {
  const output = await new Fixture('./fixtures/full').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Node module partial fields', async (t) => {
  const output = await new Fixture('./fixtures/partial').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('No repository root', async (t) => {
  const output = await new Fixture('./fixtures/no_root')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('Process warnings', async (t) => {
  const output = await new Fixture('./fixtures/warning').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Uncaught exception', async (t) => {
  const output = await new Fixture('./fixtures/uncaught').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Unhandled promises', async (t) => {
  const output = await new Fixture('./fixtures/unhandled_promise').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test.serial('Exits in plugins', async (t) => {
  const output = await new Fixture('./fixtures/plugin_exit').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Plugin errors can have a toJSON() method', async (t) => {
  const output = await new Fixture('./fixtures/plugin_error_to_json').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

// Process exit is different on Windows
// @todo: re-enable. This test is currently randomly failing.
// @todo: uncomment after upgrading to Ava v4.
// See https://github.com/netlify/build/issues/3615
// if (platform !== 'win32') {
//   test.skip('Early exit', async (t) => {
//     const output = await new Fixture('./fixtures/early_exit').runWithBuild()
//     t.snapshot(normalizeOutput(output))
//   })
// }

test('Redact API token on errors', async (t) => {
  const output = await new Fixture('./fixtures/api_token_redact')
    .withFlags({ token: '0123456789abcdef', deployId: 'test', mode: 'buildbot', testOpts: { host: '...' } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

const testMatrixAttributeTracing = [
  {
    description: 'build command error',
    input: {
      errorInfo: { location: { buildCommand: 'test-build', buildCommandOrigin: 'test-origin' } },
      severity: 'error',
      type: 'build-cmd',
      locationType: 'build-cmd-location-type',
    },
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'build-cmd',
      'build.error.location.type': 'build-cmd-location-type',
      'build.error.location.command': 'test-build',
      'build.error.location.command_origin': 'test-origin',
    },
  },
  {
    description: 'plugin error',
    input: {
      errorInfo: {
        location: {
          event: 'test-event',
          packageName: 'test-package',
          loadedFrom: 'test-loaded-from',
          origin: 'test-origin',
        },
        plugin: {
          packageName: 'test-package',
          pluginPackageJson: {
            version: '1.2.1',
          },
          extensionMetadata: {
            slug: 'test-extension-slug',
            author: 'test-extension-author',
          },
        },
      },
      severity: 'error',
      type: 'plugin-error',
      locationType: 'plugin-error-location-type',
    },
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'plugin-error',
      'build.error.location.type': 'plugin-error-location-type',
      'build.error.location.plugin.event': 'test-event',
      'build.error.location.plugin.package_name': 'test-package',
      'build.error.location.plugin.loaded_from': 'test-loaded-from',
      'build.error.location.plugin.origin': 'test-origin',
      'build.error.plugin.extensionAuthor': 'test-extension-author',
      'build.error.plugin.extensionSlug': 'test-extension-slug',
      'build.error.plugin.name': 'test-package',
      'build.error.plugin.version': '1.2.1',
    },
  },
  {
    description: 'plugin error without plugin info',
    input: {
      errorInfo: {
        location: {
          event: 'test-event',
          packageName: 'test-package',
          loadedFrom: 'test-loaded-from',
          origin: 'test-origin',
        },
      },
      severity: 'error',
      type: 'plugin-error',
      locationType: 'plugin-error-location-type',
    },
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'plugin-error',
      'build.error.location.type': 'plugin-error-location-type',
      'build.error.location.plugin.event': 'test-event',
      'build.error.location.plugin.package_name': 'test-package',
      'build.error.location.plugin.loaded_from': 'test-loaded-from',
      'build.error.location.plugin.origin': 'test-origin',
    },
  },
  {
    description: 'functions bundling error',
    input: {
      errorInfo: { location: { functionType: 'function-type', functionName: 'function-name' } },
      severity: 'error',
      type: 'func-bundle',
      locationType: 'func-bundle-location-type',
    },
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'func-bundle',
      'build.error.location.type': 'func-bundle-location-type',
      'build.error.location.function.type': 'function-type',
      'build.error.location.function.name': 'function-name',
    },
  },
  {
    description: 'core step error',
    input: {
      errorInfo: { location: { coreStepName: 'some-name' } },
      severity: 'error',
      type: 'core-step',
      locationType: 'core-step-location-type',
    },
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'core-step',
      'build.error.location.type': 'core-step-location-type',
      'build.error.location.core_step.name': 'some-name',
    },
  },
  {
    description: 'api error',
    input: {
      errorInfo: { location: { endpoint: 'some-endpoint' } },
      severity: 'error',
      type: 'api',
      locationType: 'api-location-type',
    },
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'api',
      'build.error.location.type': 'api-location-type',
      'build.error.location.api.endpoint': 'some-endpoint',
    },
  },
  {
    description: 'nothing is added',
    input: {},
    expects: {},
  },
]

testMatrixAttributeTracing.forEach(({ description, input, expects }) => {
  test(`Tracing attributes - ${description}`, async (t) => {
    const attributes = buildErrorToTracingAttributes(input)
    t.deepEqual(attributes, expects)
  })
})

test('Trusted plugins - internal errors are system errors', async (t) => {
  const fixture = new Fixture('./fixtures/trusted_plugin_uncaught')
  const { severityCode } = await fixture.runBuildProgrammatic()
  t.deepEqual(severityCode, 4)
})

test('Trusted plugins - controlled failures are user errors', async (t) => {
  const fixture = new Fixture('./fixtures/trusted_plugin')
  const { severityCode } = await fixture.runBuildProgrammatic()
  t.deepEqual(severityCode, 2)
})
