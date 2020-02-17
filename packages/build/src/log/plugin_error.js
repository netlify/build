const { white, redBright } = require('chalk')

const isNetlifyCI = require('../utils/is-netlify-ci')

const { EMPTY_LINE } = require('./empty')

// Retrieve error message when a plugin event handler fails
const getPluginErrorMessage = function({ error, id, event, package, packageJson, local }) {
  const pluginDetails = getPluginDetails(packageJson, id)
  const location = local ? 'in local plugin' : 'in npm package'
  return `${white.bold(`Plugin "${id}" failing with errors`)}
${pluginDetails}
${redBright.bold('Error location')}
Thrown from "${white.bold(event)}" event ${location} ${white.bold(package)}

${redBright.bold('Error message')}
${error.message}`
}

// Retrieve plugin's package.json details to include in error messages.
// Please note `packageJson` has been normalized by `normalize-package-data`.
const getPluginDetails = function(packageJson, id) {
  // Local logs are less verbose to allow developers to focus on the stack trace
  if (!isNetlifyCI()) {
    return EMPTY_LINE
  }

  const fields = serializeFields(packageJson, id)
  return `${EMPTY_LINE}
${redBright.bold('Plugin details')}
${fields}
${EMPTY_LINE}`
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
  if (version === '') {
    return
  }

  return version
}

const getRepository = function({ repository: { url } = {} }) {
  return url
}

const getNpmLink = function({ name }) {
  if (name === '') {
    return
  }

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

module.exports = { getPluginErrorMessage }
