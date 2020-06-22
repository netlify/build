// Retrieve plugin's package.json details to include in error messages.
// Please note `pluginPackageJson` has been normalized by `normalize-package-data`.
const getPluginInfo = function({ pluginPackageJson = {} }, { package }) {
  if (Object.keys(pluginPackageJson).length === 0) {
    return
  }

  return Object.entries(FIELDS)
    .map(([name, getField]) => serializeField({ name, getField, pluginPackageJson, package }))
    .filter(Boolean)
    .join('\n')
}

// Serialize a single package.json field
const serializeField = function({ name, getField, pluginPackageJson, package }) {
  const field = getField(pluginPackageJson, package)
  if (field === undefined) {
    return
  }

  const nameA = `${name}:`.padEnd(NAME_PADDING)
  return `${nameA}${field}`
}

const NAME_PADDING = 16

const getPackage = function(pluginPackageJson, package) {
  return package
}

const getVersion = function({ version }) {
  if (version === '') {
    return
  }

  return version
}

const getHomepage = function(pluginPackageJson = {}) {
  return getRepository(pluginPackageJson) || getNpmLink(pluginPackageJson) || getIssuesLink(pluginPackageJson)
}

const getRepository = function({ repository: { url } = {} }) {
  return url
}

const getNpmLink = function({ name }) {
  if (!name) {
    return
  }

  return `https://www.npmjs.com/package/${name}`
}

const getIssuesLink = function({ bugs: { url } = {} }) {
  return url
}

// List of package.json to serialize
const FIELDS = {
  Package: getPackage,
  Version: getVersion,
  Repository: getRepository,
  'npm link': getNpmLink,
  'Report issues': getIssuesLink,
}

module.exports = { getPluginInfo, getHomepage }
