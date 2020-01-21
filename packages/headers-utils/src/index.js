const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const writeFileAsync = promisify(fs.writeFile)
const statAsync = promisify(fs.stat)

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
const configorama = require('configorama')

async function getAll(projectPath) {
  const rulesUnique = new Set()

  const headersFilePath = path.resolve(projectPath, '_headers')
  const headersFileStats = await statAsync(headersFilePath)
  if (headersFileStats && !headersFileStats.isDirectory()) {
  }

  const configPath = await getConfigPath(undefined, projectPath)
  const configFileStats = await statAsync(configPath)
  if (configFileStats && !configFileStats.isDirectory()) {
    const config = await resolveConfig(configPath, { cwd: projectPath })

    for (const hr of config.headers) {
      rulesUnique.push(JSON.stringify(hr))
    }
  }

  return Array.from(rulesUnique).map(item => JSON.parse(item))
}

async function remove(rule, projectPath) {
  const configPath = await getConfigPath(undefined, projectPath)
  const config = await resolveConfig(configPath, { cwd: projectPath })

  const allRules = new Set(await getAll(projectPath))

  const ruleString = JSON.stringify(rule)

  for (const hr of allRules.values()) {
    if (JSON.stringify(hr) === ruleString) {
      allRules.delete(ruleString)
    }
  }

  config.headers = allRules

  const TOMLConfig = configorama.format.toml.dump(config)

  return writeFileAsync(path.resolve(projectPath, 'netlify.toml'), TOMLConfig, { flag: 'w' })
}

async function add(rule = {}, projectPath) {
  const rulesUnique = new Set((await getAll(projectPath)).map(r => JSON.stringify(r)))
  rulesUnique.add(JSON.stringify(rule))

  const rules = Array.from(rulesUnique).map(item => JSON.parse(item))
  const configPath = await getConfigPath(undefined, projectPath)
  const config = await resolveConfig(configPath, { cwd: projectPath })

  config.redirects = rules

  const TOMLConfig = configorama.format.toml.dump(config)

  return writeFileAsync(path.resolve(projectPath, 'netlify.toml'), TOMLConfig, { flag: 'w' })
}

module.exports = {
  getAll,
  remove,
  add,
}
