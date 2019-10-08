const { formatUtils } = require('@netlify/config')

const { writeFile } = require('../utils/fs')
const { logTomlWrite } = require('../log/main')

// Write TOML file to support current buildbot
const tomlWrite = async function(config, baseDir) {
  const toml = formatUtils.toml.dump(config)
  const tomlPath = `${baseDir}/netlify.toml`
  await writeFile(tomlPath, toml)

  logTomlWrite(tomlPath, toml)
}

module.exports = { tomlWrite }
