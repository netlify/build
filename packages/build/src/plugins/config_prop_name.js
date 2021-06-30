'use strict'

// Retrieve normalized property name
const getPropName = function (keys) {
  return keys.reduce(normalizeDynamicProp, '')
}

// Some properties are user-defined, i.e. we need to replace them with a "*" token
const normalizeDynamicProp = function (propName, key) {
  const normalizedKey = isDynamicObjectProp(propName, key) ? '*' : String(key)
  return propName === '' ? normalizedKey : `${propName}.${normalizedKey}`
}

// Check if a property name is dynamic, such as `functions.{functionName}`
const isDynamicObjectProp = function (propName, key) {
  return isArrayItem(key) || DYNAMIC_OBJECT_PROPS.has(propName)
}

// Check it the value is a value item. In that case, we replace its indice by "*"
const isArrayItem = function (key) {
  return typeof key !== 'symbol' && Number.isInteger(Number(key))
}

// Properties with dynamic children
const DYNAMIC_OBJECT_PROPS = new Set(['functions', 'functions.*'])

module.exports = { getPropName }
