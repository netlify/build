/**
 * responsible for any js based projects
 * and can therefore build in assumptions that only js projects have
 *
 */
const { existsSync, readFileSync } = require('fs')

const memoize = require('memoizee')

let warnedAboutEmptyScript = false

/** hold package.json in a singleton so we dont do expensive parsing repeatedly */
function parsePkgJSON() {
  if (!existsSync('package.json')) throw new Error('dont call this method unless you already checked for pkg json')
  return JSON.parse(readFileSync('package.json', { encoding: 'utf8' }))
}
const getPkgJSON = memoize(parsePkgJSON)

function getPackageManagerCommand() {
  return existsSync('yarn.lock') ? 'yarn' : 'npm'
}

/**
 * real utiltiies are down here
 *
 */

function hasRequiredDeps(requiredDepArray) {
  const { dependencies, devDependencies } = getPkgJSON()
  for (let depName of requiredDepArray) {
    const hasItInDeps = dependencies && dependencies[depName]
    const hasItInDevDeps = devDependencies && devDependencies[depName]
    if (!hasItInDeps && !hasItInDevDeps) {
      return false
    }
  }
  return true
}

const requiredFilesAvailable = []
function hasRequiredFiles(filenameArr) {
  for (const filename of filenameArr) {
    if (requiredFilesAvailable.includes(filename)) continue
    if (!existsSync(filename)) {
      return false
    } else {
      requiredFilesAvailable.push(filename)
    }
  }
  return true
}

// preferredScriptsArr is in decreasing order of preference
function scanScripts({ preferredScriptsArr, preferredCommand }) {
  const { scripts } = getPkgJSON()

  if (!scripts && !warnedAboutEmptyScript) {
    // eslint-disable-next-line no-console
    console.log(`You have a package.json without any npm scripts.`)
    // eslint-disable-next-line no-console
    console.log(
      `Netlify Build's detector system works best with a script, or you can specify a command to run in the netlify.toml [build]  block `,
    )
    warnedAboutEmptyScript = true // dont spam message with every detector
    return [] // not going to match any scripts anyway
  }
  /**
   *
   * NOTE: we return an array of arrays (args)
   * because we may want to supply extra args in some setups
   *
   * e.g. ['eleventy', '--serve', '--watch']
   *
   * array will in future be sorted by likelihood of what we want
   *
   *  */
  // this is very simplistic logic, we can offer far more intelligent logic later
  // eg make a dependency tree of npm scripts and offer the parentest node first
  let possibleArgsArrs = preferredScriptsArr
    .filter(s => Object.keys(scripts).includes(s))
    .filter(s => !scripts[s].includes('netlify dev')) // prevent netlify dev calling netlify dev
    .map(x => [x]) // make into arr of arrs

  Object.entries(scripts)
    .filter(([k]) => !preferredScriptsArr.includes(k))
    .forEach(([k, v]) => {
      if (v.includes(preferredCommand)) possibleArgsArrs.push([k])
    })

  return possibleArgsArrs
}

module.exports = {
  hasRequiredDeps: memoize(hasRequiredDeps),
  hasRequiredFiles: memoize(hasRequiredFiles),
  packageManagerCommand: getPackageManagerCommand(),
  scanScripts: memoize(scanScripts),
}
