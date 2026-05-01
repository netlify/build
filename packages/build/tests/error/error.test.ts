import { normalizeOutput } from '@netlify/testing/lib/normalize.js'
import { Fixture } from '@netlify/testing/lib/fixture.js'
import { test, expect } from 'vitest';

import {
  buildErrorToTracingAttributes,
  type BuildError,
  type BasicErrorInfo
} from '../../lib/error/types.js'

test('exception', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/exception').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('exception with static properties', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/exception_props').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('exception with circular references', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/exception_circular').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('exception that are strings', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/exception_string').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('exception that are arrays', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/exception_array').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Do not log secret values on build errors', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/log_secret').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('TOML parsing errors', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/toml_parsing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Invalid error instances', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/invalid_instance').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Top-level errors', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/top').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Top function errors local', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/function').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Node module all fields', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/full').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Node module partial fields', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/partial').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('No repository root', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/no_root')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Process warnings', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/warning').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Uncaught exception', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/uncaught').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Unhandled promises', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/unhandled_promise').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Exits in plugins', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_exit').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Plugin errors can have a toJSON() method', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_error_to_json').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

// Process exit is different on Windows
// @todo: re-enable. This test is currently randomly failing.
// @todo: uncomment after upgrading to Ava v4.
// See https://github.com/netlify/build/issues/3615
// if (platform !== 'win32') {
//   test.skip('Early exit', async (t) => {
//     const output = await new Fixture(import.meta.url, './fixtures/early_exit').runWithBuild()
//     t.snapshot(normalizeOutput(output))
//   })
// }

test('Redact API token on errors', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/api_token_redact')
    .withFlags({ token: '0123456789abcdef', deployId: 'test', mode: 'buildbot', testOpts: { host: '...' } })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

const testMatrixAttributeTracing: Array<{
  description: string;
  input: BuildError | BasicErrorInfo;
  expects: Record<string, string>;
}> = [
  {
    description: 'build command error',
    input: {
      errorInfo: { location: { buildCommand: 'test-build', buildCommandOrigin: 'test-origin' } },
      severity: 'error',
      type: 'buildCommand',
      locationType: 'build-cmd-location-type',
    } as BasicErrorInfo,
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'buildCommand',
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
            version: '1.2.3',
            name: 'test-extension-name',
            has_build: true,
            has_connector: false,
          },
        },
      },
      severity: 'error',
      type: 'failPlugin',
      locationType: 'plugin-error-location-type',
    } as BasicErrorInfo,
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'failPlugin',
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
      type: 'failPlugin',
      locationType: 'plugin-error-location-type',
    } as BasicErrorInfo,
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'failPlugin',
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
      type: 'functionsBundling',
      locationType: 'func-bundle-location-type',
    } as BasicErrorInfo,
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'functionsBundling',
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
      type: 'coreStep',
      locationType: 'core-step-location-type',
    } as BasicErrorInfo,
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'coreStep',
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
    } as BasicErrorInfo,
    expects: {
      'build.error.severity': 'error',
      'build.error.type': 'api',
      'build.error.location.type': 'api-location-type',
      'build.error.location.api.endpoint': 'some-endpoint',
    },
  },
  {
    description: 'nothing is added',
    input: {} as BasicErrorInfo,
    expects: {},
  },
]

testMatrixAttributeTracing.forEach(({ description, input, expects }) => {
  test(`Tracing attributes - ${description}`, async () => {
    const attributes = buildErrorToTracingAttributes(input)
    expect(attributes).toEqual(expects)
  })
})

test('Trusted plugins - internal errors are system errors', async () => {
  const fixture = new Fixture(import.meta.url, './fixtures/trusted_plugin_uncaught')
  const { severityCode } = await fixture.runBuildProgrammatic() as { severityCode: number }
  expect(severityCode).toEqual(4)
})

test('Trusted plugins - controlled failures are user errors', async () => {
  const fixture = new Fixture(import.meta.url, './fixtures/trusted_plugin')
  const { severityCode } = await fixture.runBuildProgrammatic() as { severityCode: number }
  expect(severityCode).toEqual(2)
})
