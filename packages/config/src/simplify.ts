import isPlainObj from 'is-plain-obj'

import type { BuildConfigWithout, PartialNetlifyConfig, PartialNetlifyConfigWithout } from './types/config.js'
import { removeFalsy } from './utils/remove_falsy.js'

type Properties = Record<string, unknown>

/** A configuration, possibly with `build.environment` reduced to a list of names as `cleanupConfig` does. */
type SimplifiableConfig = PartialNetlifyConfigWithout<'build'> & {
  build?: BuildConfigWithout<'environment'> & { environment?: unknown }
}

/** Remove default values (empty objects and arrays, default redirect flags), e.g. before writing `netlify.toml`. */
export const simplifyConfig = function ({
  build: { environment, processing: { css, html, images, js, ...processing } = {}, services, ...build } = {},
  functions,
  plugins,
  headers,
  redirects,
  context = {},
  ...config
}: SimplifiableConfig): Properties {
  const simplifiedBuild = {
    ...build,
    ...simplifyEnvironment(environment),
    ...removeEmptyObject(
      {
        ...processing,
        ...removeEmptyObject(css, 'css'),
        ...removeEmptyObject(html, 'html'),
        ...removeEmptyObject(images, 'images'),
        ...removeEmptyObject(js, 'js'),
      },
      'processing',
    ),
    ...removeEmptyObject(services, 'services'),
  }
  return removeFalsy({
    ...config,
    ...removeEmptyObject(simplifyFunctions(functions), 'functions'),
    ...removeEmptyObject(simplifiedBuild, 'build'),
    ...removeEmptyArray(plugins, 'plugins'),
    ...removeEmptyArray(headers, 'headers'),
    ...removeEmptyArray(simplifyRedirects(redirects), 'redirects'),
    ...removeEmptyObject(simplifyContexts(context), 'context'),
  })
}

// `environment` is a list of names when called by `cleanupConfig`.
const simplifyEnvironment = function (environment: unknown): Properties {
  return Array.isArray(environment)
    ? removeEmptyArray(environment, 'environment')
    : removeEmptyObject(environment, 'environment')
}

const simplifyContexts = function (contexts: Record<string, PartialNetlifyConfig>): Properties {
  return Object.fromEntries(
    Object.entries(contexts).map(([context, contextConfig]) => [context, simplifyConfig(contextConfig)]),
  )
}

const simplifyFunctions = function (functions: unknown): unknown {
  return isPlainObj(functions)
    ? Object.entries(functions).reduce<Properties>(
        (simplified, [key, value]) => ({ ...simplified, ...removeEmptyObject(value, key) }),
        {},
      )
    : functions
}

const simplifyRedirects = function (redirects: unknown): unknown {
  return Array.isArray(redirects) ? redirects.map(simplifyRedirect) : redirects
}

const simplifyRedirect = function (redirect: unknown): unknown {
  if (!isPlainObj(redirect)) {
    return redirect
  }

  const { force, proxy, query, conditions, headers, ...rest } = redirect
  return {
    ...rest,
    ...(force === false ? {} : { force }),
    ...(proxy === false ? {} : { proxy }),
    ...removeEmptyObject(query, 'query'),
    ...removeEmptyObject(conditions, 'conditions'),
    ...removeEmptyObject(headers, 'headers'),
  }
}

/** `{ [propName]: object }` without its empty values, or `{}` if nothing is left or it isn't a plain object. */
export const removeEmptyObject = function (object: unknown, propName: string): Properties {
  if (!isPlainObj(object)) {
    return {}
  }

  const nonEmpty = removeFalsy(object)
  return Object.keys(nonEmpty).length === 0 ? {} : { [propName]: nonEmpty }
}

/** `{ [propName]: array }`, or `{}` if it is empty or not an array. */
export const removeEmptyArray = function (array: unknown, propName: string): Properties {
  if (!Array.isArray(array)) {
    return {}
  }

  return array.length === 0 ? {} : { [propName]: array }
}
