import { promises as fs } from 'fs'
import { join } from 'path'

import isPlainObj from 'is-plain-obj'
import { pathExists } from 'path-exists'

export const validateEdgeManifest = async (edgeFunctionsDistPath) => {
  try {
    const manifestPath = join(edgeFunctionsDistPath, 'manifest.json')

    const manifestFileExists = await pathExists(manifestPath)

    if (manifestFileExists) {
      const data = await fs.readFile(manifestPath)
      const manifest = JSON.parse(data)

      validateIsObj(manifest)
      validateExpectedProps(manifest)
      validateBundlesProp(manifest)
      validateRoutesProp(manifest)
      validateBundlerVersionProp(manifest)
    }
  } catch (error) {
    error.message = `Edge Functions manifest error: ${error.message}`
    throw error
  }
}

const isArrayOfObjects = function (objects) {
  return Array.isArray(objects) && objects.every(isPlainObj)
}

const validateIsObj = (manifest) => {
  if (!isPlainObj(manifest)) {
    throw new Error('must be a plain object')
  }
}

const EXPECTED_PROPS = new Set(['bundles', 'routes', 'bundler_version'])

const validateExpectedProps = (manifest) => {
  const unknownProp = Object.keys(manifest).find((key) => !EXPECTED_PROPS.has(key))
  if (unknownProp !== undefined) {
    throw new Error(`unknown property "${unknownProp}"`)
  }
}

const validateBundlesProp = ({ bundles }) => {
  if (bundles === undefined) {
    throw new Error('must contain a "bundles" property')
  }

  if (!isArrayOfObjects(bundles)) {
    throw new Error('"bundles" property must be an array of objects')
  }

  bundles.forEach(validateBundle)
}

const validateBundle = function (bundle, index) {
  try {
    validateExpectedBundleProps(bundle)
    validateBundleAsset(bundle)
    validateBundleFormat(bundle)
  } catch (error) {
    error.message = `"bundles" property is invalid.
Bundle at position ${index} ${error.message}.`
    throw error
  }
}

const EXPECTED_BUNDLE_PROPS = new Set(['asset', 'format'])

const validateExpectedBundleProps = (bundle) => {
  const unknownProp = Object.keys(bundle).find((key) => !EXPECTED_BUNDLE_PROPS.has(key))
  if (unknownProp !== undefined) {
    throw new Error(`has an unknown property "${unknownProp}"`)
  }
}

const validateBundleAsset = ({ asset }) => {
  if (asset === undefined) {
    throw new Error('must contain a "asset" property')
  }

  if (typeof asset !== 'string') {
    throw new TypeError('"asset" property must be a string')
  }
}

const validateBundleFormat = function ({ format }) {
  if (format === undefined) {
    throw new Error('must contain a "format" property')
  }

  if (typeof format !== 'string') {
    throw new TypeError('"format" property must be a string')
  }
}

const validateRoutesProp = ({ routes }) => {
  if (routes === undefined) {
    throw new Error('must contain a "routes" property')
  }

  if (!isArrayOfObjects(routes)) {
    throw new Error('"routes" property must be an array of objects')
  }

  routes.forEach(validateRoute)
}

const validateRoute = function (route, index) {
  try {
    validateExpectedRouteProps(route)
    validateRouteFunction(route)
    validateRoutePattern(route)
  } catch (error) {
    error.message = `"routes" property is invalid.
Route at position ${index} ${error.message}.`
    throw error
  }
}

const EXPECTED_ROUTE_PROPS = new Set(['function', 'pattern'])

const validateExpectedRouteProps = (route) => {
  const unknownProp = Object.keys(route).find((key) => !EXPECTED_ROUTE_PROPS.has(key))
  if (unknownProp !== undefined) {
    throw new Error(`has an unknown property "${unknownProp}"`)
  }
}

const validateRouteFunction = (route) => {
  if (route.function === undefined) {
    throw new Error('must contain a "function" property')
  }

  if (typeof route.function !== 'string') {
    throw new TypeError('"function" property must be a string')
  }
}

const validateRoutePattern = function ({ pattern }) {
  if (pattern === undefined) {
    throw new Error('must contain a "pattern" property')
  }

  if (!(new RegExp(pattern) instanceof RegExp)) {
    throw new TypeError('"pattern" property must be a Regex pattern')
  }
}

/* eslint-disable camelcase */
const validateBundlerVersionProp = ({ bundler_version }) => {
  if (bundler_version === undefined) {
    throw new Error('must contain a "bundler_version" property')
  }

  if (typeof bundler_version !== 'string') {
    throw new TypeError('"bundler_version" property must be a string')
  }
}
/* eslint-enable camelcase */
