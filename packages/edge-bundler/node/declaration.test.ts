import { test, expect } from 'vitest'

import { FunctionConfig } from './config.js'
import { getDeclarationsFromConfig } from './declaration.js'

// TODO: Add tests with the deploy config.
const deployConfig = {
  declarations: [],
  layers: [],
}

test('In-source config takes precedence over netlify.toml config', () => {
  const tomlConfig = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const funcConfig = {
    geolocation: { path: ['/geo-isc', '/*'], cache: 'manual' },
    json: { path: '/json', cache: 'off' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [
    { function: 'geolocation', path: '/geo-isc', cache: 'manual' },
    { function: 'geolocation', path: '/*', cache: 'manual' },
    { function: 'json', path: '/json', cache: 'off' },
  ]

  const declarations = getDeclarationsFromConfig(tomlConfig, funcConfig, deployConfig)

  expect(declarations).toEqual(expectedDeclarations)
})

test("Declarations don't break if no in-source config is provided", () => {
  const tomlConfig = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const funcConfig = {
    geolocation: { path: ['/geo-isc'], cache: 'manual' },
    json: {},
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [
    { function: 'geolocation', path: '/geo-isc', cache: 'manual' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const declarations = getDeclarationsFromConfig(tomlConfig, funcConfig, deployConfig)

  expect(declarations).toEqual(expectedDeclarations)
})

test('In-source config works independent of the netlify.toml file if a path is defined and otherwise if no path is set', () => {
  const tomlConfig = [{ function: 'geolocation', path: '/geo', cache: 'off' }]

  const funcConfigWithPath = {
    json: { path: ['/json', '/json-isc'], cache: 'off' },
  } as Record<string, FunctionConfig>

  const funcConfigWithoutPath = {
    json: { cache: 'off' },
  } as Record<string, FunctionConfig>

  const expectedDeclarationsWithISCPath = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json', cache: 'off' },
    { function: 'json', path: '/json-isc', cache: 'off' },
  ]

  const expectedDeclarationsWithoutISCPath = [{ function: 'geolocation', path: '/geo', cache: 'off' }]

  const declarationsWithISCPath = getDeclarationsFromConfig(tomlConfig, funcConfigWithPath, deployConfig)
  expect(declarationsWithISCPath).toEqual(expectedDeclarationsWithISCPath)

  const declarationsWithoutISCPath = getDeclarationsFromConfig(tomlConfig, funcConfigWithoutPath, deployConfig)
  expect(declarationsWithoutISCPath).toEqual(expectedDeclarationsWithoutISCPath)
})

test('In-source config works if only the cache config property is set', () => {
  const tomlConfig = [{ function: 'geolocation', path: '/geo', cache: 'off' }]

  const funcConfig = {
    geolocation: { cache: 'manual' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [{ function: 'geolocation', path: '/geo', cache: 'manual' }]

  expect(getDeclarationsFromConfig(tomlConfig, funcConfig, deployConfig)).toEqual(expectedDeclarations)
})

test("In-source config path property works if it's not an array", () => {
  const tomlConfig = [{ function: 'json', path: '/json-toml', cache: 'off' }]

  const funcConfig = {
    json: { path: '/json', cache: 'manual' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [{ function: 'json', path: '/json', cache: 'manual' }]

  expect(getDeclarationsFromConfig(tomlConfig, funcConfig, deployConfig)).toEqual(expectedDeclarations)
})

test("In-source config path property works if it's not an array and it's not present in toml or deploy config", () => {
  const tomlConfig = [{ function: 'geolocation', path: '/geo', cache: 'off' }]
  const funcConfig = {
    json: { path: '/json-isc', cache: 'manual' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json-isc', cache: 'manual' },
  ]

  expect(getDeclarationsFromConfig(tomlConfig, funcConfig, deployConfig)).toEqual(expectedDeclarations)
})

test('In-source config works if path property is an empty array with cache value specified', () => {
  const tomlConfig = [{ function: 'json', path: '/json-toml', cache: 'off' }]

  const funcConfig = {
    json: { path: [], cache: 'manual' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [{ function: 'json', path: '/json-toml', cache: 'manual' }]

  expect(getDeclarationsFromConfig(tomlConfig, funcConfig, deployConfig)).toEqual(expectedDeclarations)
})
