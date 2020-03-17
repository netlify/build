// Retrieve plugin's package.json details to include in error messages.
// Please note `packageJson` has been normalized by `normalize-package-data`.
const getPluginBlock = function({ packageJson = {} }, { package }) {
  if (Object.keys(packageJson).length === 0) {
    return
  }

  const fields = serializeFields(packageJson, package)
  return { name: 'Plugin details', value: fields }
}

// Iterate over a series of package.json fields, serialize each then join them
const serializeFields = function(packageJson, package) {
  return Object.entries(FIELDS)
    .map(([name, getField]) => serializeField({ name, getField, packageJson, package }))
    .filter(Boolean)
    .join('\n')
}

// Serialize a single package.json field
const serializeField = function({ name, getField, packageJson, package }) {
  const field = getField(packageJson, package)
  if (field === undefined) {
    return
  }

  const nameA = `${name}:`.padEnd(NAME_PADDING)
  return `${nameA}${field}`
}

const NAME_PADDING = 16

const getPackage = function(packageJson, package) {
  return package
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
  ID: getPackage,
  Version: getVersion,
  Repository: getRepository,
  'npm link': getNpmLink,
  'Report issues': getIssuesLink,
}

module.exports = { getPluginBlock }
