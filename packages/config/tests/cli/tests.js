import { promises as fs } from 'fs'
import { normalize } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'
import del from 'del'
import isCI from 'is-ci'
import { tmpName as getTmpName } from 'tmp-promise'

const INVALID_CONFIG_PATH = fileURLToPath(new URL('invalid', import.meta.url))

test('--help', async (t) => {
  const { output } = await new Fixture().withFlags({ help: true }).runBinary()
  t.snapshot(normalizeOutput(output))
})

test('--version', async (t) => {
  const { output } = await new Fixture().withFlags({ version: true }).runBinary()
  t.snapshot(normalizeOutput(output))
})

test('Success', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').runBinary()
  t.snapshot(normalizeOutput(output))
})

test('User error', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ config: INVALID_CONFIG_PATH }).runBinary()
  t.snapshot(normalizeOutput(output))
})

test('CLI flags', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ branch: 'test' }).runBinary()
  t.snapshot(normalizeOutput(output))
})

test('Stabilitize output with the --stable flag', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ stable: true }).runBinary()
  t.snapshot(normalizeOutput(output))
})

test('Does not stabilitize output without the --stable flag', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ stable: false }).runBinary()
  t.snapshot(normalizeOutput(output))
})

test('Write on file with the --output flag', async (t) => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    await new Fixture('./fixtures/empty').withFlags({ output }).runBinary()
    const content = await fs.readFile(output)
    const { context } = JSON.parse(content)
    t.is(context, 'production')
  } finally {
    await fs.unlink(output)
  }
})

test('Do not write on stdout with the --output flag', async (t) => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    const result = await new Fixture('./fixtures/empty').withFlags({ output }).runBinary()
    t.is(result.output, '')
  } finally {
    await fs.unlink(output)
  }
})

test('Write on stdout with the --output=- flag', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ output: '-' }).runBinary()
  t.snapshot(normalizeOutput(output))
})

// This test is too slow in local development
if (isCI) {
  test('Handles big outputs', async (t) => {
    const fixturesDir = normalize(`${fileURLToPath(test.meta.file)}/../fixtures`)
    const bigNetlify = `${fixturesDir}/big/netlify.toml`
    await del(bigNetlify, { force: true })
    try {
      const bigContent = getBigNetlifyContent()
      await fs.writeFile(bigNetlify, bigContent)
      const { output } = await new Fixture('./fixtures/big').withFlags({ output: '-' }).runBinary()
      t.notThrows(() => {
        JSON.parse(output)
      })
    } finally {
      await del(bigNetlify, { force: true })
    }
  })

  const getBigNetlifyContent = function () {
    const envVars = Array.from({ length: BIG_NUMBER }, getEnvVar).join('\n')
    return `[build.environment]\n${envVars}`
  }

  const BIG_NUMBER = 1e4
}

const getEnvVar = function (value, index) {
  return `TEST${index} = ${index}`
}
