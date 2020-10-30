'use strict'

const del = require('del')
const { tmpName, dir: tmpDir } = require('tmp-promise')

// Retrieve name of a temporary directory
const getDist = function () {
  return tmpName({ prefix: PREFIX })
}

// Create temporary directory
const createDist = async function () {
  const { path } = await tmpDir({ prefix: PREFIX })
  return path
}

const PREFIX = 'test-functions-utils-'

// Remove temporary directory
const removeDist = async function (dir) {
  await del(dir, { force: true })
}

module.exports = { getDist, createDist, removeDist }
