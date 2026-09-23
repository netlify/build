import { join } from 'path'
import { fileURLToPath } from 'url'

import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

// When the config file's `build.base` points to another directory, the config is loaded a
// second time from that directory. That second pass does not use `config` or `packagePath`.

type Result = { configPath: string; config: { build: { command: string } } }

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

const resolveFixture = async (fixtureName: string, flags: Record<string, unknown>) =>
  (await new Fixture(import.meta.url, `./fixtures/${fixtureName}`).withFlags(flags).runWithConfigAsObject()) as Result

test('The second pass loads the config from the new base directory, even with the config option', async () => {
  const { configPath, config } = await resolveFixture('second_pass_config_opt', {
    config: join(FIXTURES_DIR, 'second_pass_config_opt/custom.toml'),
  })

  expect(configPath).toBe(join(FIXTURES_DIR, 'second_pass_config_opt/sub/netlify.toml'))
  expect(config.build.command).toBe('from sub/netlify.toml')
})

test('There is no second pass when baseRelDir is false', async () => {
  const { configPath, config } = await resolveFixture('second_pass_config_opt', {
    config: join(FIXTURES_DIR, 'second_pass_config_opt/custom.toml'),
    baseRelDir: false,
  })

  expect(configPath).toBe(join(FIXTURES_DIR, 'second_pass_config_opt/custom.toml'))
  expect(config.build.command).toBe('from custom.toml')
})

test('The second pass does not look for the config in the package path', async () => {
  const { configPath, config } = await resolveFixture('second_pass_package_path', { packagePath: 'pkg' })

  expect(configPath).toBe(join(FIXTURES_DIR, 'second_pass_package_path/sub/netlify.toml'))
  expect(config.build.command).toBe('from sub/netlify.toml')
})
