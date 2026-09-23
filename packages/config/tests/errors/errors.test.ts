import { applyMutations, resolveConfig } from '@netlify/config'
import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

const resolveFixture = (fixtureName: string, flags: Record<string, unknown> = {}) =>
  resolveConfig(new Fixture(import.meta.url, `./fixtures/${fixtureName}`).withFlags(flags).getConfigFlags())

const getRejection = async (promise: Promise<unknown>): Promise<Error> => {
  try {
    await promise
  } catch (error) {
    if (error instanceof Error) return error
  }
  throw new Error('Expected the promise to reject with an Error')
}

const getThrown = (func: () => unknown): Error => {
  try {
    func()
  } catch (error) {
    if (error instanceof Error) return error
  }
  throw new Error('Expected the function to throw an Error')
}

// netlify-cli and @netlify/build tell user errors apart from bugs by this property.
const expectUserError = (error: Error) => {
  expect(error).toHaveProperty('customErrorInfo', { type: 'resolveConfig' })
}

test('Invalid TOML is a user error, reported against the config file', async () => {
  const error = await getRejection(resolveFixture('invalid_toml'))

  expectUserError(error)
  expect(error.message).toMatch(
    /^When resolving config file .*invalid_toml[\\/]netlify\.toml:\nCould not parse configuration file/,
  )
})

test('An invalid property is a user error, reported against the config file', async () => {
  const error = await getRejection(resolveFixture('invalid_property'))

  expectUserError(error)
  expect(error.message).toMatch(
    /^When resolving config file .*invalid_property[\\/]netlify\.toml:\nConfiguration property build\.command must be a string/,
  )
})

test('A --config file that does not exist is a user error', async () => {
  const error = await getRejection(resolveFixture('invalid_property', { config: 'does-not-exist.toml' }))

  expectUserError(error)
  expect(error.message).toMatch(
    /^When resolving config file .*does-not-exist\.toml:\nConfiguration file does not exist/,
  )
})

test('A mutation of a read-only property is a user error, reported without a stage prefix', async () => {
  const error = await getRejection(
    resolveFixture('invalid_property', {
      configMutations: [{ keys: ['build', 'base'], value: 'other', event: 'onPreBuild' }],
      configMutationsOrigin: 'a plugin',
    }),
  )

  expectUserError(error)
  expect(error.message).toBe('"netlifyConfig.build.base" is read-only.')
})

test('applyMutations() throws user errors', () => {
  const error = getThrown(() => applyMutations({}, [{ keys: ['build', 'base'], value: 'other', event: 'onPreBuild' }]))

  expectUserError(error)
  expect(error.message).toBe('"netlifyConfig.build.base" is read-only.')
})
