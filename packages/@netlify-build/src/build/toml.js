const { formatUtils } = require('@netlify/config')

const { writeFile } = require('../utils/fs')

// Write TOML file to support current buildbot
const tomlWrite = async function(netlifyConfig, baseDir) {
  if (!isNetlifyCI()) {
    return
  }

  const toml = formatUtils.toml.dump(netlifyConfig)
  const tomlPath = `${baseDir}/netlify.toml`
  await writeFile(tomlPath, toml)

  logTomlWrite(tomlPath, toml)
}

// Test if inside netlify build context
const isNetlifyCI = function() {
  return Boolean(process.env.DEPLOY_PRIME_URL)
}

const logTomlWrite = function(tomlPath, toml) {
  console.log()
  console.log('TOML output:')
  console.log()
  console.log(toml)
  console.log(`TOML file written to ${tomlPath}`)
}

module.exports = { tomlWrite }
