const resolve = require('resolve')

// Import plugin either by module name or by file path
const importPlugin = function(name, baseDir) {
  const moduleName = addPackageScope(name)
  const modulePath = resolvePlugin(moduleName, baseDir)

  try {
    return require(modulePath)
  } catch (error) {
    console.log(`Error loading '${moduleName}' plugin`)
    throw error
  }
}

// YAML does not allow object keys to start with `@`. However npm scoped
// packages do, so we allow users to omit them.
const addPackageScope = function(name) {
  if (!SCOPED_PACKAGE_REGEXP.test(name)) {
    return name
  }

  return `@${name}`
}

const SCOPED_PACKAGE_REGEXP = /^[\w-][\w-.]*\/[\w-.]+$/

// We use `resolve` because `require()` should be relative to `baseDir` not to
// this `__filename`
const resolvePlugin = function(moduleName, baseDir) {
  try {
    return resolve.sync(moduleName, { basedir: baseDir })
  } catch (error) {
    // TODO: if plugin not found, automatically try to `npm install` it
    console.log(`'${moduleName}' plugin not installed or found`)
    throw error
  }
}

module.exports = { importPlugin }
