const { writeFile } = require('fs')
const { promisify } = require('util')

const { formatUtils } = require('@netlify/config')

const { logTomlWrite } = require('../log/main')

const pWriteFile = promisify(writeFile)

// Write TOML file to support current buildbot
const tomlWrite = async function(config, baseDir) {
  const toml = formatUtils.toml.dump(config)
  const tomlPath = `${baseDir}/netlify.toml`
  await pWriteFile(tomlPath, toml)

  logTomlWrite(tomlPath, toml)
}

module.exports = { tomlWrite }
