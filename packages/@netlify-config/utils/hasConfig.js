const fs = require('fs')
const path = require('path')

const configFileName = 'netlify'

module.exports = async function getConfigPath(dirPath) {
  if (isNetlifyFile(dirPath) && (await fileExists(dirPath))) {
    // Full config path supplied exit early
    return dirPath
  }

  const formats = ['toml', 'yml', 'yaml', 'json', 'js']

  const checkForFiles = formats.map(format => {
    return fileExists(path.join(dirPath, `${configFileName}.${format}`))
  })

  const files = await Promise.all(checkForFiles)
  const foundFormats = files
    .map((exists, i) => {
      return exists ? formats[i] : false
    })
    .filter(exists => exists)

  // Ensure config file exists
  if (!foundFormats.length) {
    throw new Error(`No "${configFileName}" config found in ${dirPath}`)
  }

  // Ensure only one type of config file found
  if (foundFormats.length > 1) {
    const msg = foundFormats.map(f => `"netlify.${f}"`).join(' and ')
    throw new Error(`Multiple config files found. ${msg}\nPlease include only 1 type of config`)
  }

  return path.join(dirPath, `${configFileName}.${foundFormats[0]}`)
}

function isNetlifyFile(filePath) {
  const regex = new RegExp(`${configFileName}.(toml|yml|yaml|json|js)$`)
  return filePath.match(regex)
}

function fileExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.F_OK, err => {
      if (err) return resolve(false)
      return resolve(true)
    })
  })
}
