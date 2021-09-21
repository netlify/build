'use strict'

const { stat, writeFile } = require('fs')
const { relative, join } = require('path')
const { promisify } = require('util')

const { listFunctions } = require('@netlify/zip-it-and-ship-it')

const pStat = promisify(stat)
const pWriteFile = promisify(writeFile)

const { addErrorInfo } = require('../../error/info')

const getFunctionPaths = async function (functionsSrc) {
  if (functionsSrc === undefined) {
    return []
  }

  const functions = await listFunctions(functionsSrc)
  return functions.map(({ mainFile }) => relative(functionsSrc, mainFile))
}

const getUserAndInternalFunctions = ({
  functionsSrc,
  functionsSrcExists,
  internalFunctionsSrc,
  internalFunctionsSrcExists,
}) => {
  const paths = [
    functionsSrcExists ? functionsSrc : undefined,
    internalFunctionsSrcExists ? internalFunctionsSrc : undefined,
  ]

  return Promise.all(paths.map((path) => path && getFunctionPaths(path)))
}

// Returns `true` if the functions directory exists and is valid. Returns
// `false` if it doesn't exist. Throws an error if it's invalid or can't
// be accessed.
const validateFunctionsSrc = async function ({ functionsSrc, relativeFunctionsSrc }) {
  if (functionsSrc === undefined) {
    return false
  }

  try {
    const stats = await pStat(functionsSrc)

    if (stats.isDirectory()) {
      return true
    }

    const error = new Error(
      `The Netlify Functions setting should target a directory, not a regular file: ${relativeFunctionsSrc}`,
    )

    addErrorInfo(error, { type: 'resolveConfig' })

    throw error
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    }

    throw error
  }
}

const writeToScheduleFile = async (buildDir, zisiResult) => {
  const schedule = zisiResult
    .filter(({ config }) => Boolean(config.schedule))
    .map(({ name, config }) => ({ name, schedule: config.schedule }))

  if (schedule.length === 0) {
    return
  }

  const scheduleFile = JSON.stringify(schedule, null, 2)

  // TODO: what's the exact path where we should write? somewhere in .netlify? in the root dir?
  await pWriteFile(join(buildDir, '_schedule'), scheduleFile)
}

module.exports = { getUserAndInternalFunctions, validateFunctionsSrc, writeToScheduleFile }
