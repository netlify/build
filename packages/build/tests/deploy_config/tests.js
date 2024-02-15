import { promises as fs } from 'fs'
import { platform } from 'process'

import { Fixture } from '@netlify/testing'
import test from 'ava'
import { tmpName } from 'tmp-promise'

test('Does not mutate read-only properties', async (t) => {
  const { netlifyConfig } = await new Fixture('./fixtures/readonly_properties')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuildAndIntrospect()
  t.deepEqual(netlifyConfig.plugins, [])
})

test('Loads configuration data that has been generated by the build command', async (t) => {
  const expectedImageDomains = [
    'domain1.from-toml.netlify',
    'domain2.from-toml.netlify',
    'domain1.from-api.netlify',
    'domain2.from-api.netlify',
  ]
  const systemLogFile = await tmpName()
  const { netlifyConfig } = await new Fixture('./fixtures/from_build_command')
    .withFlags({
      debug: false,
      featureFlags: { netlify_build_deploy_configuration_api: true },
      systemLogFile: await fs.open(systemLogFile, 'a'),
    })
    .runWithBuildAndIntrospect()

  t.deepEqual(netlifyConfig.images, {
    remote_images: expectedImageDomains,
  })

  if (platform !== 'win32') {
    const systemLog = await fs.readFile(systemLogFile, { encoding: 'utf8' })
    const match = systemLog.match(/Netlify configuration property "images.remote_images" value changed to \[(.*)\]/s)
    const imageDomains = JSON.parse(`[${match[1].replace(/'/g, '"')}]`)

    t.deepEqual(imageDomains, expectedImageDomains)
  }
})

test('Configuration data is exposed to build plugins in the `onBuild` event', async (t) => {
  const { netlifyConfig, success } = await new Fixture('./fixtures/with_build_plugin')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuildAndIntrospect()
  t.deepEqual(netlifyConfig.images, {
    remote_images: ['domain1.from-api.netlify', 'domain2.from-api.netlify', 'domain1.from-plugin.netlify'],
  })
  t.true(success)
})

test('Throws an error if the deploy configuration file is malformed', async (t) => {
  const { output, success } = await new Fixture('./fixtures/malformed_config')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuildAndIntrospect()
  t.false(success)
  t.true(
    output.includes(`Error: An error occured while processing the platform configurarion defined by your framework`),
  )
})

test('Does not throw an error if the deploy configuration file is missing', async (t) => {
  const { success } = await new Fixture('./fixtures/missing_config')
    .withFlags({
      featureFlags: { netlify_build_deploy_configuration_api: true },
    })
    .runWithBuildAndIntrospect()
  t.true(success)
})
