'use strict'

const isPlainObj = require('is-plain-obj')

const { removeFalsy } = require('./utils/remove_falsy')

// Removes default values (empty objects and arrays) from the configuration.
const simplifyConfig = function ({
  build: { environment, processing: { css, html, images, js, ...processing } = {}, services, ...build } = {},
  functions,
  plugins,
  redirects,
  ...config
}) {
  const buildA = {
    ...build,
    ...removeEmptyArray(environment, 'environment'),
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
    ...removeEmptyObject(buildA, 'build'),
    ...removeEmptyArray(plugins, 'plugins'),
    ...removeEmptyArray(simplifyRedirects(redirects), 'redirects'),
  })
}

const simplifyFunctions = function (functions) {
  return isPlainObj(functions) ? Object.entries(functions).reduce(simplifyFunction, {}) : functions
}

const simplifyFunction = function (functions, [key, value]) {
  return { ...functions, ...removeEmptyObject(value, key) }
}

const simplifyRedirects = function (redirects) {
  return Array.isArray(redirects) ? redirects.map(simplifyRedirect) : redirects
}

const simplifyRedirect = function (redirect) {
  if (!isPlainObj(redirect)) {
    return redirect
  }

  const { force, proxy, query, conditions, headers, ...redirectA } = redirect
  return {
    ...redirectA,
    ...removeDefaultValue(force, 'force', false),
    ...removeDefaultValue(proxy, 'proxy', false),
    ...removeEmptyObject(query, 'query'),
    ...removeEmptyObject(conditions, 'conditions'),
    ...removeEmptyObject(headers, 'headers'),
  }
}

const removeDefaultValue = function (value, propName, defaultValue) {
  return value === defaultValue ? {} : { [propName]: value }
}

const removeEmptyObject = function (object, propName) {
  if (!isPlainObj(object)) {
    return {}
  }

  const objectA = removeFalsy(object)
  return Object.keys(objectA).length === 0 ? {} : { [propName]: objectA }
}

const removeEmptyArray = function (array, propName) {
  if (!Array.isArray(array)) {
    return {}
  }

  return array.length === 0 ? {} : { [propName]: array }
}

module.exports = { simplifyConfig, removeEmptyObject, removeEmptyArray }
