const { stat } = require('fs')
const { promisify } = require('util')

const pStat = promisify(stat)

// Check if a directory exists
const dirExists = async function(path) {
  try {
    const fileStat = await pStat(path)
    return fileStat.isDirectory()
  } catch (error) {
    return false
  }
}

module.exports = { dirExists }
