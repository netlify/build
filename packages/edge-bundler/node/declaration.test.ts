import { test, expect } from 'vitest'

import { FunctionConfig } from './config.js'
import { getDeclarationsFromConfig } from './declaration.js'

// TODO: Add tests with the deploy config.
const deployConfig = {
  declarations: [],
  layers: [],
}

test('In source config takes precedence over netlify.toml config', () => {
  const tomlConfig = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const funcConfig = {
    geolocation: { path: '/geo-isc', cache: 'manual' },
    json: { path: '/json', cache: 'off' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [
    { function: 'geolocation', path: '/geo-isc', cache: 'manual' },
    { function: 'json', path: '/json', cache: 'off' },
  ]

  const declarations = getDeclarationsFromConfig(tomlConfig, funcConfig, deployConfig)

  expect(declarations).toEqual(expectedDeclarations)
})

test("Declarations don't break if no in source config is provided", () => {
  const tomlConfig = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const funcConfig = {
    geolocation: { path: '/geo-isc', cache: 'manual' },
    json: {},
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [
    { function: 'geolocation', path: '/geo-isc', cache: 'manual' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const declarations = getDeclarationsFromConfig(tomlConfig, funcConfig, deployConfig)

  expect(declarations).toEqual(expectedDeclarations)
})

test('In source config works independent of the netlify.toml file if a path is defined and otherwise if no path is set', () => {
  const tomlConfig = [{ function: 'geolocation', path: '/geo', cache: 'off' }]

  const funcConfigWithPath = {
    json: { path: '/json', cache: 'off' },
  } as Record<string, FunctionConfig>

  const funcConfigWithoutPath = {
    json: { cache: 'off' },
  } as Record<string, FunctionConfig>

  const expectedDeclarationsWithISCPath = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json', cache: 'off' },
  ]

  const expectedDeclarationsWithoutISCPath = [{ function: 'geolocation', path: '/geo', cache: 'off' }]

  const declarationsWithISCPath = getDeclarationsFromConfig(tomlConfig, funcConfigWithPath, deployConfig)
  expect(declarationsWithISCPath).toEqual(expectedDeclarationsWithISCPath)

  const declarationsWithoutISCPath = getDeclarationsFromConfig(tomlConfig, funcConfigWithoutPath, deployConfig)
  expect(declarationsWithoutISCPath).toEqual(expectedDeclarationsWithoutISCPath)
})
