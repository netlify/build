import isPlainObj from 'is-plain-obj'

import { spreadValue } from './normalize_values.js'
import type { RawConfig } from './types.js'

/** Remove empty values, for writing `netlify.toml` and for printing. */
export const simplifyConfig = function ({
  build,
  functions,
  plugins,
  headers,
  redirects,
  context,
  ...config
}: RawConfig): RawConfig {
  return removeFalsy({
    ...config,
    functions: simplifyFunctions(functions),
    build: simplifyBuild(build),
    plugins: nonEmptyArray(plugins),
    headers: nonEmptyArray(headers),
    redirects: nonEmptyArray(simplifyRedirects(redirects)),
    context: nonEmptyObject(simplifyContexts(context)),
  })
}

// `environment` is a list of names when called by `cleanupConfig`.
const simplifyBuild = function (build: unknown): RawConfig | undefined {
  const { environment, processing, services, ...rest } = spreadValue(build)
  return nonEmptyObject({
    ...rest,
    environment: Array.isArray(environment) ? nonEmptyArray(environment) : nonEmptyObject(environment),
    processing: simplifyProcessing(processing),
    services: nonEmptyObject(services),
  })
}

const simplifyProcessing = function (processing: unknown): RawConfig | undefined {
  const { css, html, images, js, ...rest } = spreadValue(processing)
  return nonEmptyObject({
    ...rest,
    css: nonEmptyObject(css),
    html: nonEmptyObject(html),
    images: nonEmptyObject(images),
    js: nonEmptyObject(js),
  })
}

const simplifyFunctions = function (functions: unknown): RawConfig | undefined {
  if (!isPlainObj(functions)) {
    return undefined
  }

  const entries = Object.entries(functions).map(([name, functionConfig]): [string, unknown] => [
    name,
    nonEmptyObject(functionConfig),
  ])
  return nonEmptyObject(Object.fromEntries(entries))
}

const simplifyRedirects = function (redirects: unknown): unknown {
  return Array.isArray(redirects) ? redirects.map(simplifyRedirect) : undefined
}

// Only the properties with defaults are simplified. The others are kept as they are, even empty.
// An absent `force` or `proxy` is kept as an `undefined` key, as it always has been.
const simplifyRedirect = function (redirect: unknown): unknown {
  if (!isPlainObj(redirect)) {
    return redirect
  }

  const { force, proxy, query, conditions, headers, ...rest } = redirect
  return {
    ...rest,
    ...(force === false ? {} : { force }),
    ...(proxy === false ? {} : { proxy }),
    ...nonEmptyProperty('query', query),
    ...nonEmptyProperty('conditions', conditions),
    ...nonEmptyProperty('headers', headers),
  }
}

const nonEmptyProperty = function (name: string, value: unknown): RawConfig {
  const nonEmpty = nonEmptyObject(value)
  return nonEmpty === undefined ? {} : { [name]: nonEmpty }
}

// An entry that simplifies to `{}` is kept, and is written as an empty `[context.<name>]` table.
const simplifyContexts = function (contexts: unknown): RawConfig {
  const entries = Object.entries(spreadValue(contexts)).map(([name, contextConfig]): [string, RawConfig] => [
    name,
    simplifyConfig(spreadValue(contextConfig)),
  ])
  return Object.fromEntries(entries)
}

const nonEmptyObject = function (value: unknown): RawConfig | undefined {
  if (!isPlainObj(value)) {
    return undefined
  }

  const nonEmpty = removeFalsy(value)
  return Object.keys(nonEmpty).length === 0 ? undefined : nonEmpty
}

const nonEmptyArray = (value: unknown): unknown[] | undefined =>
  Array.isArray(value) && value.length !== 0 ? value : undefined

const removeFalsy = (object: RawConfig): RawConfig =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => !isFalsy(value)))

// `false` and `0` are values, not empty ones.
const isFalsy = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
