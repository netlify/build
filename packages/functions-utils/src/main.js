const { basename, dirname } = require('path')
const { stat } = require('fs')
const { promisify } = require('util')

const cpy = require('cpy')
const pathExists = require('path-exists')

const pStat = promisify(stat)

// Add a Netlify Function file to the `functions` directory so it is processed
// by `@netlify/plugin-functions-core`
const functionsUtils = function({ constants: { FUNCTIONS_SRC }, failBuild }) {
  return { add: add.bind(null, FUNCTIONS_SRC, failBuild) }
}

const add = async function(dist, src, failBuild) {
  if (src === undefined) {
    failBuild('No function directory was specified')
  }

  if (!(await pathExists(src))) {
    failBuild(`No function file or directory found at "${src}"`)
  }

  const functionsDist = `${dist}/${basename(src)}`
  if (await pathExists(functionsDist)) {
    failBuild(`Function file or directory already exists at "${functionsDist}"`)
  }

  const srcGlob = await getSrcGlob(src)
  await cpy(srcGlob, dist, { cwd: dirname(src), parents: true, overwrite: false })
}

const getSrcGlob = async function(src) {
  const srcBasename = basename(src)
  const stat = await pStat(src)

  if (stat.isDirectory()) {
    return `${srcBasename}/**`
  }

  return srcBasename
}

module.exports = functionsUtils
