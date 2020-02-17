/**
 * responsible for any js based projects
 * and can therefore build in assumptions that only js projects have
 *
 */
const { existsSync, readFileSync } = require('fs')
const path = require('path')

const semver = require('semver')
const memoize = require('memoizee')

let warnedAboutEmptyScript = false

/** hold package.json in a singleton so we dont do expensive parsing repeatedly */
function parsePkgJSON(dir) {
  if (!existsSync(path.join(dir, 'package.json'))) throw new Error('dont call this method unless you already checked for pkg json')
  return JSON.parse(readFileSync(path.join(dir, 'package.json'), { encoding: 'utf8' }))
}
const getPkgJSON = memoize(parsePkgJSON)

function getPackageManagerCommand(dir) {
  return existsSync(path.join(dir, 'yarn.lock')) ? 'yarn' : 'npm'
}

/**
 * real utiltiies are down here
 *
 */

function hasRequiredDeps(requiredDepArray, dir) {
  const { dependencies, devDependencies } = getPkgJSON(dir)
  for (let depName of requiredDepArray) {
    const hasItInDeps = dependencies && dependencies[depName]
    const hasItInDevDeps = devDependencies && devDependencies[depName]
    if (!hasItInDeps && !hasItInDevDeps) {
      return false
    }
  }
  return true
}

function hasRequiredFiles(filenameArr, dir) {
  for (const filename of filenameArr) {
    if (!existsSync(path.join(dir, filename))) {
      return false
    }
  }
  return true
}

// preferredScriptsArr is in decreasing order of preference
function scanScripts({ preferredScriptsArr, preferredCommand, projectDir }) {
  const { scripts } = getPkgJSON(projectDir)

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

function getLanguageVersion(lang, projectDir) {
  switch (lang) {
    case "nodejs": {
      const configPath = path.join(projectDir, '.nvmrc')
      if (existsSync(configPath)) {
        const nodeVersion = readFileSync(configPath, { encoding: 'utf8' }).replace('\n', '');
        return semver.clean(nodeVersion)
      }
      break
    }
    default:
      return lang
  }
}

module.exports = {
  hasRequiredDeps: memoize(hasRequiredDeps),
  hasRequiredFiles: memoize(hasRequiredFiles),
  getPackageManagerCommand: memoize(getPackageManagerCommand),
  scanScripts: memoize(scanScripts),
  getLanguageVersion: memoize(getLanguageVersion),
}
