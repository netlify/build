import type { PackageJson } from 'read-package-up'

// `normalize-package-data` turns `bugs` and `repository` into objects
type pkgJSONData = { name?: string; version?: string; bugs?: { url?: string }; repository?: { url?: string } }

type FieldLocation = { packageName?: string | undefined; loadedFrom?: string | undefined }

type FieldGetter = (pluginPackageJson: pkgJSONData, location: FieldLocation) => string | undefined

// Retrieve plugin's package.json details to include in error messages.
// Please note `pluginPackageJson` has been normalized by `normalize-package-data`.
export const getPluginInfo = function (
  { pluginPackageJson = {} }: { pluginPackageJson?: PackageJson | undefined },
  { packageName, loadedFrom }: FieldLocation,
) {
  if (Object.keys(pluginPackageJson).length === 0) {
    return
  }

  return Object.entries(FIELDS)
    .map(([name, getField]) =>
      serializeField({
        name,
        getField,
        // Normalized by `normalize-package-data`
        pluginPackageJson: pluginPackageJson as pkgJSONData,
        packageName,
        loadedFrom,
      }),
    )
    .filter(Boolean)
    .join('\n')
}

// Serialize a single package.json field
const serializeField = function ({
  name,
  getField,
  pluginPackageJson,
  packageName,
  loadedFrom,
}: FieldLocation & { name: string; getField: FieldGetter; pluginPackageJson: pkgJSONData }) {
  const field = getField(pluginPackageJson, { packageName, loadedFrom })
  if (field === undefined) {
    return
  }

  const nameA = `${name}:`.padEnd(NAME_PADDING)
  return `${nameA}${field}`
}

const NAME_PADDING = 16

const getPackage = function (_: pkgJSONData, { packageName }: FieldLocation) {
  return packageName
}

const getVersion = function ({ version }: pkgJSONData) {
  if (version === '') {
    return
  }

  return version
}

export const getHomepage = function (
  pluginPackageJson: pkgJSONData = {},
  { loadedFrom }: { loadedFrom?: string | undefined } = {},
) {
  const repository = getRepository(pluginPackageJson)
  if (repository) {
    return repository
  }

  const npmLink = getNpmLink(pluginPackageJson, { loadedFrom })
  if (npmLink) {
    return npmLink
  }

  return getIssuesLink(pluginPackageJson)
}

const getRepository = function ({ repository: { url } = {} }: pkgJSONData) {
  return url
}

const getNpmLink = function ({ name }: pkgJSONData, { loadedFrom }: { loadedFrom?: string | undefined }) {
  if (!name || loadedFrom === 'local') {
    return
  }

  return `https://www.npmjs.com/package/${name}`
}

const getIssuesLink = function ({ bugs: { url } = {} }: pkgJSONData) {
  return url
}

// List of package.json to serialize
const FIELDS: Record<string, FieldGetter> = {
  Package: getPackage,
  Version: getVersion,
  Repository: getRepository,
  'npm link': getNpmLink,
  'Report issues': getIssuesLink,
}
