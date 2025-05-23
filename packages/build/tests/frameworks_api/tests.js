import { promises as fs } from 'fs'
import { dirname, resolve } from 'path'
import { platform, version as nodeVersion } from 'process'

import { Fixture } from '@netlify/testing'
import test from 'ava'
import semver from 'semver'
import tmp from 'tmp-promise'

test('Does not mutate read-only properties', async (t) => {
  const { netlifyConfig } = await new Fixture('./fixtures/readonly_properties').runWithBuildAndIntrospect()
  t.deepEqual(netlifyConfig.plugins, [])
})

test('Loads configuration data that has been generated by the build command', async (t) => {
  const systemLogFile = await tmp.file()
  const { netlifyConfig } = await new Fixture('./fixtures/from_build_command')
    .withFlags({
      debug: false,
      systemLogFile: systemLogFile.fd,
    })
    .runWithBuildAndIntrospect()

  t.deepEqual(netlifyConfig.functions, {
    '*': {},
    'my_framework*': {
      included_files: ['files/**'],
    },
  })
  t.deepEqual(netlifyConfig.images, {
    remote_images: [
      'domain1.from-toml.netlify',
      'domain2.from-toml.netlify',
      'domain1.from-api.netlify',
      'domain2.from-api.netlify',
    ],
  })
  t.deepEqual(netlifyConfig.redirects, [
    {
      from: '/from-config-override',
      query: {},
      to: '/to-config-override',
      status: 418,
      force: true,
      conditions: {},
      headers: {},
    },
    {
      from: '/from-config',
      query: {},
      to: '/to-config',
      status: 418,
      force: true,
      conditions: {},
      headers: {},
    },
  ])

  // No file descriptors on Windows, so system logging doesn't work.
  if (platform !== 'win32') {
    const systemLog = await fs.readFile(systemLogFile.path, { encoding: 'utf8' })
    const expectedProperties = ['images.remote_images', 'functions.my_framework*', 'redirects']

    expectedProperties.forEach((property) => {
      t.true(systemLog.includes(`Netlify configuration property "${property}" value changed to`))
    })
  }
})

test('Loads configuration data that has been generated by the build command using the legacy API path', async (t) => {
  const expectedImageDomains = [
    'domain1.from-toml.netlify',
    'domain2.from-toml.netlify',
    'domain1.from-api.netlify',
    'domain2.from-api.netlify',
  ]
  const systemLogFile = await tmp.file()
  const { netlifyConfig } = await new Fixture('./fixtures/from_build_command_legacy')
    .withFlags({
      debug: false,
      systemLogFile: systemLogFile.fd,
    })
    .runWithBuildAndIntrospect()

  t.deepEqual(netlifyConfig.images, {
    remote_images: expectedImageDomains,
  })

  if (platform !== 'win32') {
    const systemLog = await fs.readFile(systemLogFile.path, { encoding: 'utf8' })
    const match = systemLog.match(/Netlify configuration property "images.remote_images" value changed to \[(.*)\]/s)
    const imageDomains = JSON.parse(`[${match[1].replace(/'/g, '"')}]`)

    t.deepEqual(imageDomains, expectedImageDomains)
  }
})

// the monorepo works with pnpm which is not always available
if (semver.gte(nodeVersion, '18.19.0')) {
  test('In a monorepo setup, loads package-specific configuration data', async (t) => {
    const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot({ git: false })
    const { success, netlifyConfig } = await fixture
      .withFlags({
        cwd: fixture.repositoryRoot,
        packagePath: 'apps/app-1',
      })
      .runWithBuildAndIntrospect()

    t.true(success)
    t.deepEqual(netlifyConfig.images, {
      remote_images: ['domain1.netlify', 'domain2.netlify'],
    })
  })
}

test('Configuration data is exposed to build plugins in the `onBuild` event', async (t) => {
  const { netlifyConfig, success } = await new Fixture('./fixtures/with_build_plugin').runWithBuildAndIntrospect()
  t.deepEqual(netlifyConfig.images, {
    remote_images: ['domain1.from-api.netlify', 'domain2.from-api.netlify', 'domain1.from-plugin.netlify'],
  })
  t.true(success)
})

test('Throws an error if the deploy configuration file is malformed', async (t) => {
  const { output, success } = await new Fixture('./fixtures/malformed_config').runWithBuildAndIntrospect()
  t.false(success)
  t.true(
    output.includes(`Error: An error occured while processing the platform configurarion defined by your framework`),
  )
})

test('Does not throw an error if the deploy configuration file is missing', async (t) => {
  const { success } = await new Fixture('./fixtures/missing_config').runWithBuildAndIntrospect()
  t.true(success)
})

test('Removes any leftover files from a previous build', async (t) => {
  const systemLogFile = await tmp.file()
  const fixture = new Fixture('./fixtures/leftover_config').withFlags({
    debug: false,
    systemLogFile: systemLogFile.fd,
  })
  const configPath = resolve(fixture.repositoryRoot, '.netlify/v1/config.json')

  await fs.mkdir(dirname(configPath), { force: true, recursive: true })
  await fs.copyFile(resolve(fixture.repositoryRoot, 'config.seed.json'), configPath)

  const { netlifyConfig } = await fixture.runWithBuildAndIntrospect()

  t.deepEqual(netlifyConfig.images, {
    remote_images: ['domain1.from-toml.netlify', 'domain2.from-toml.netlify'],
  })
})
