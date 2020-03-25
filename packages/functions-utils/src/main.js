const { basename, dirname } = require('path')
const { stat } = require('fs')
const { promisify } = require('util')

const cpy = require('cpy')
const pathExists = require('path-exists')

const pStat = promisify(stat)

// Add a Netlify Function file to the `functions` directory so it is processed
// by `@netlify/plugin-functions-core`
const add = async function(src, dist, { fail = defaultFail } = {}) {
  if (src === undefined) {
    return fail('No function source directory was specified')
  }

  if (!(await pathExists(src))) {
    return fail(`No function file or directory found at "${src}"`)
  }

  if (dist === undefined) {
    return fail('No function destination directory was specified')
  }

  const srcBasename = basename(src)
  const functionsDist = `${dist}/${srcBasename}`
  if (await pathExists(functionsDist)) {
    return fail(`Function file or directory already exists at "${functionsDist}"`)
  }

  const srcGlob = await getSrcGlob(src, srcBasename)
  await cpy(srcGlob, dist, { cwd: dirname(src), parents: true, overwrite: false })
}

const defaultFail = function(message) {
  throw new Error(message)
}

const getSrcGlob = async function(src, srcBasename) {
  const stat = await pStat(src)

  if (stat.isDirectory()) {
    return `${srcBasename}/**`
  }

  return srcBasename
}

module.exports = { add }
