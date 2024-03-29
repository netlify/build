// Retrieve plugin's package.json details to include in error messages.
// Please note `pluginPackageJson` has been normalized by `normalize-package-data`.
export const getPluginInfo = function ({ pluginPackageJson = {} }, { packageName, loadedFrom }) {
  if (Object.keys(pluginPackageJson).length === 0) {
    return
  }

  return Object.entries(FIELDS)
    .map(([name, getField]) => serializeField({ name, getField, pluginPackageJson, packageName, loadedFrom }))
    .filter(Boolean)
    .join('\n')
}

// Serialize a single package.json field
const serializeField = function ({ name, getField, pluginPackageJson, packageName, loadedFrom }) {
  const field = getField(pluginPackageJson, { packageName, loadedFrom })
  if (field === undefined) {
    return
  }

  const nameA = `${name}:`.padEnd(NAME_PADDING)
  return `${nameA}${field}`
}

const NAME_PADDING = 16

const getPackage = function (_, { packageName }) {
  return packageName
}

const getVersion = function ({ version }) {
  if (version === '') {
    return
  }

  return version
}

type pkgJSONData = { name?: string; bugs?: { url?: string }; repository?: { url?: string } }

export const getHomepage = function (
  pluginPackageJson: pkgJSONData = {},
  { loadedFrom }: { loadedFrom?: string } = {},
) {
  return (
    getRepository(pluginPackageJson) ||
    getNpmLink(pluginPackageJson, { loadedFrom }) ||
    getIssuesLink(pluginPackageJson)
  )
}

const getRepository = function ({ repository: { url } = {} }: pkgJSONData) {
  return url
}

const getNpmLink = function ({ name }: pkgJSONData, { loadedFrom }: { loadedFrom?: string }) {
  if (!name || loadedFrom === 'local') {
    return
  }

  return `https://www.npmjs.com/package/${name}`
}

const getIssuesLink = function ({ bugs: { url } = {} }: pkgJSONData) {
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
