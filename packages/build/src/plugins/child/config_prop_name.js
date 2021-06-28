'use strict'

// Retrieve normalized property name
const getPropName = function (keys) {
  return serializeKeys(keys.map(normalizeDynamicProp))
}

// Some properties are user-defined, i.e. we need to replace them with a "*" token
const normalizeDynamicProp = function (key, index, keys) {
  return isArrayItem(key) || isDynamicObjectProp(keys, index) ? '*' : key
}

// Check it the value is a value item. In that case, we replace its indice by "*"
const isArrayItem = function (key) {
  return typeof key !== 'symbol' && Number.isInteger(Number(key))
}

// Check if a property name is dynamic, such as `functions.{functionName}`
const isDynamicObjectProp = function (keys, index) {
  return (
    index !== 0 &&
    DYNAMIC_OBJECT_PROPS.has(serializeKeys(keys.slice(0, index))) &&
    !NON_DYNAMIC_OBJECT_PROPS.has(serializeKeys(keys.slice(0, index + 1)))
  )
}

const serializeKeys = function (keys) {
  return keys.map(String).join('.')
}

// Properties with dynamic children
const DYNAMIC_OBJECT_PROPS = new Set(['functions'])
// Children properties which should not be considered dynamic
const NON_DYNAMIC_OBJECT_PROPS = new Set([
  'functions.directory',
  'functions.external_node_modules',
  'functions.ignored_node_modules',
  'functions.included_files',
  'functions.node_bundler',
])

module.exports = { getPropName }
