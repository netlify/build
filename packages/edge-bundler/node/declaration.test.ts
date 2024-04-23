import { test, expect } from 'vitest'

import { FunctionConfig } from './config.js'
import { Declaration, mergeDeclarations, normalizePattern } from './declaration.js'

const deployConfigDeclarations: Declaration[] = []

test('Ensure the order of edge functions with FF', () => {
  const deployConfigDeclarations: Declaration[] = [
    { function: 'framework-manifest-a', path: '/path1' },
    { function: 'framework-manifest-c', path: '/path3' },
    { function: 'framework-manifest-b', path: '/path2' },
  ]

  const tomlConfig: Declaration[] = [
    { function: 'user-toml-a', path: '/path1' },
    { function: 'user-toml-c', path: '/path3' },
    { function: 'user-toml-b', path: '/path2' },
  ]

  const userFuncConfig = {
    'user-isc-c': { path: ['/path1', '/path2'] },
  } as Record<string, FunctionConfig>

  const internalFuncConfig = {
    'framework-isc-c': { path: ['/path1', '/path2'] },
  } as Record<string, FunctionConfig>

  expect(mergeDeclarations(tomlConfig, userFuncConfig, internalFuncConfig, deployConfigDeclarations)).toMatchSnapshot()
})

test('In-source config takes precedence over netlify.toml config', () => {
  const tomlConfig: Declaration[] = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const userFuncConfig = {
    geolocation: { path: ['/geo-isc', '/*'], cache: 'manual' },
    json: { path: '/json', cache: 'off' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [
    { function: 'geolocation', path: '/geo-isc', cache: 'manual' },
    { function: 'geolocation', path: '/*', cache: 'manual' },
    { function: 'json', path: '/json', cache: 'off' },
  ]

  const declarations = mergeDeclarations(tomlConfig, userFuncConfig, {}, deployConfigDeclarations)

  expect(declarations).toEqual(expectedDeclarations)
})

test("Declarations don't break if no in-source config is provided", () => {
  const tomlConfig: Declaration[] = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const userFuncConfig = {
    geolocation: { path: ['/geo-isc'], cache: 'manual' },
    json: {},
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [
    { function: 'geolocation', path: '/geo-isc', cache: 'manual' },
    { function: 'json', path: '/json', cache: 'manual' },
  ]

  const declarations = mergeDeclarations(tomlConfig, userFuncConfig, {}, deployConfigDeclarations)

  expect(declarations).toEqual(expectedDeclarations)
})

test('In-source config works independent of the netlify.toml file if a path is defined and otherwise if no path is set', () => {
  const tomlConfig: Declaration[] = [{ function: 'geolocation', path: '/geo', cache: 'off' }]

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

  const declarationsWithISCPath = mergeDeclarations(tomlConfig, funcConfigWithPath, {}, deployConfigDeclarations)
  expect(declarationsWithISCPath).toEqual(expectedDeclarationsWithISCPath)

  const declarationsWithoutISCPath = mergeDeclarations(tomlConfig, funcConfigWithoutPath, {}, deployConfigDeclarations)
  expect(declarationsWithoutISCPath).toEqual(expectedDeclarationsWithoutISCPath)
})

test('In-source config works if only the cache config property is set', () => {
  const tomlConfig: Declaration[] = [{ function: 'geolocation', path: '/geo', cache: 'off' }]

  const funcConfig = {
    geolocation: { cache: 'manual' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [{ function: 'geolocation', path: '/geo', cache: 'manual' }]

  expect(mergeDeclarations(tomlConfig, funcConfig, {}, deployConfigDeclarations)).toEqual(expectedDeclarations)
})

test("In-source config path property works if it's not an array", () => {
  const tomlConfig: Declaration[] = [{ function: 'json', path: '/json-toml', cache: 'off' }]

  const funcConfig = {
    json: { path: '/json', cache: 'manual' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [{ function: 'json', path: '/json', cache: 'manual' }]

  expect(mergeDeclarations(tomlConfig, funcConfig, {}, deployConfigDeclarations)).toEqual(expectedDeclarations)
})

test("In-source config path property works if it's not an array and it's not present in toml or deploy config", () => {
  const tomlConfig: Declaration[] = [{ function: 'geolocation', path: '/geo', cache: 'off' }]
  const funcConfig = {
    json: { path: '/json-isc', cache: 'manual' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [
    { function: 'geolocation', path: '/geo', cache: 'off' },
    { function: 'json', path: '/json-isc', cache: 'manual' },
  ]

  expect(mergeDeclarations(tomlConfig, funcConfig, {}, deployConfigDeclarations)).toEqual(expectedDeclarations)
})

test('In-source config works if path property is an empty array with cache value specified', () => {
  const tomlConfig: Declaration[] = [{ function: 'json', path: '/json-toml', cache: 'off' }]

  const funcConfig = {
    json: { path: [], cache: 'manual' },
  } as Record<string, FunctionConfig>

  const expectedDeclarations = [{ function: 'json', path: '/json-toml', cache: 'manual' }]

  expect(mergeDeclarations(tomlConfig, funcConfig, {}, deployConfigDeclarations)).toEqual(expectedDeclarations)
})

test('netlify.toml-defined excludedPath are respected', () => {
  const tomlConfig: Declaration[] = [{ function: 'geolocation', path: '/geo/*', excludedPath: '/geo/exclude' }]

  const funcConfig = {}

  const expectedDeclarations = [{ function: 'geolocation', path: '/geo/*', excludedPath: '/geo/exclude' }]

  const declarations = mergeDeclarations(tomlConfig, funcConfig, {}, deployConfigDeclarations)

  expect(declarations).toEqual(expectedDeclarations)
})

test('Does not escape front slashes in a regex pattern if they are already escaped', () => {
  const regexPattern = '^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/([^/.]{1,}))\\/shows(?:\\/(.*))(.json)?[\\/#\\?]?$'
  const expected = '^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/([^/.]{1,}))\\/shows(?:\\/(.*))(.json)?[\\/#\\?]?$'

  expect(normalizePattern(regexPattern)).toEqual(expected)
})

test('Escapes front slashes in a regex pattern', () => {
  const regexPattern = '^(?:/(_next/data/[^/]{1,}))?(?:/([^/.]{1,}))/shows(?:/(.*))(.json)?[/#\\?]?$'
  const expected = '^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/([^/.]{1,}))\\/shows(?:\\/(.*))(.json)?[/#\\?]?$'

  expect(normalizePattern(regexPattern)).toEqual(expected)
})

test('Ensures pattern match on the whole path', () => {
  const regexPattern = '/foo/.*/bar'
  const expected = '^\\/foo\\/.*\\/bar$'

  expect(normalizePattern(regexPattern)).toEqual(expected)
})
