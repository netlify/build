// Retrieve plugin's package.json details to include in error messages.
// Please note `packageJson` has been normalized by `normalize-package-data`.
const getPluginBlock = function({ packageJson = {}, id }) {
  if (Object.keys(packageJson).length === 0) {
    return
  }

  const fields = serializeFields(packageJson, id)
  return { name: 'Plugin details', value: fields }
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
  'npm link': getNpmLink,
  'Report issues': getIssuesLink,
}

module.exports = { getPluginBlock }
