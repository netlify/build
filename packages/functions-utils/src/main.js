'use strict'

const { stat } = require('fs')
const { basename, dirname } = require('path')
const { promisify } = require('util')

const cpy = require('cpy')
const pathExists = require('path-exists')

const pStat = promisify(stat)

// Add a Netlify Function file to the `functions` directory so it is processed
// by `@netlify/plugin-functions-core`
const add = async function (src, dist, { fail = defaultFail } = {}) {
  if (src === undefined) {
    return fail('No function source directory was specified')
  }

  if (!(await pathExists(src))) {
    return fail(`No function file or directory found at "${src}"`)
  }

  if (dist === undefined) {
    return fail('No function directory was specified')
  }

  const srcBasename = basename(src)
  const functionsDist = `${dist}/${srcBasename}`
  if (await pathExists(functionsDist)) {
    return fail(`Function file or directory already exists at "${functionsDist}"`)
  }

  const srcGlob = await getSrcGlob(src, srcBasename)
  await cpy(srcGlob, dist, { cwd: dirname(src), parents: true, overwrite: false })
}

const getSrcGlob = async function (src, srcBasename) {
  const srcStat = await pStat(src)

  if (srcStat.isDirectory()) {
    return `${srcBasename}/**`
  }

  return srcBasename
}

const list = async function (functionsSrc, { fail = defaultFail } = {}) {
  if (functionsSrc === undefined) {
    return fail('No function directory was specified')
  }

  // This package currently supports Node 8 but not zip-it-and-ship-it
  // @todo put the `require()` to the top-level scope again once Node 8 support
  // is removed
  // eslint-disable-next-line node/global-require
  const { listFunctions } = require('@netlify/zip-it-and-ship-it')
  try {
    return await listFunctions(functionsSrc)
  } catch (error) {
    fail('Could not list Netlify Functions', { error })
  }
}

const listAll = async function (functionsSrc, { fail = defaultFail } = {}) {
  if (functionsSrc === undefined) {
    return fail('No function directory was specified')
  }

  // This package currently supports Node 8 but not zip-it-and-ship-it
  // @todo put the `require()` to the top-level scope again once Node 8 support
  // is removed
  // eslint-disable-next-line node/global-require
  const { listFunctionsFiles } = require('@netlify/zip-it-and-ship-it')
  try {
    return await listFunctionsFiles(functionsSrc)
  } catch (error) {
    fail('Could not list Netlify Functions files', { error })
  }
}

const defaultFail = function (message) {
  throw new Error(message)
}

module.exports = { add, list, listAll }
