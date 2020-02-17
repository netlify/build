const { redBright } = require('chalk')

const isNetlifyCI = require('../utils/is-netlify-ci')

// Retrieve plugin's package.json details to include in error messages.
// Please note `packageJson` has been normalized by `normalize-package-data`.
const getPluginDetails = function(packageJson, id) {
  // Local logs are less verbose to allow developers to focus on the stack trace
  if (!isNetlifyCI()) {
    return ''
  }

  const fields = serializeFields(packageJson, id)
  return `
${redBright.bold('Plugin details')}
${fields}`
}

// Iterate over a series of package.json fields, serialize each then join them
const serializeFields = function(packageJson, id) {
  return Object.entries(FIELDS)
    .map(([name, getField]) => serializeField({ name, getField, packageJson, id }))
    .filter(Boolean)
    .join('\n')
}

// Serialize a single package.json field
const serializeField = function({ name, getField, packageJson, id }) {
  const field = getField(packageJson, id)
  if (field === undefined) {
    return
  }

  const nameA = `${name}:`.padEnd(NAME_PADDING)
  return `${nameA}${field}`
}

const NAME_PADDING = 16

const getId = function(packageJson, id) {
  return id
}

const getVersion = function({ version }) {
  return version
}

const getRepository = function({ repository: { url } = {} }) {
  return url
}

const getNpmLink = function({ name }) {
  return `https://www.npmjs.com/package/${name}`
}

const getIssuesLink = function({ bugs: { url } = {} }) {
  return url
}

// List of package.json to serialize
const FIELDS = {
  ID: getId,
  Version: getVersion,
  Repository: getRepository,
  'NPM link': getNpmLink,
  'Report issues': getIssuesLink,
}

module.exports = { getPluginDetails }
