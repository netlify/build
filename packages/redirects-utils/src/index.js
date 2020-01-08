const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const writeFileAsync = promisify(fs.writeFile)

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
const { parseRedirectsFormat, parseNetlifyConfig } = require('netlify-redirect-parser')
const configorama = require('configorama')

async function parseFile(parser, name, filePath) {
  const result = await parser(filePath)
  if (result.errors.length) {
    console.error(`Warnings while parsing ${name} file:`)
    result.errors.forEach(err => console.error(`  ${err.lineNum}: ${err.line} -- ${err.reason}`))
  }
  return result.success
}

async function getAll(projectPath) {
  const rulesUnique = new Set()

  const configPath = await getConfigPath(undefined, projectPath)
  const redirectsFilePath = path.resolve(projectPath, '_redirects')

  if (fs.existsSync(redirectsFilePath)) {
    const fileName = redirectsFilePath
      .split(path.sep)
      .pop();

    (await parseFile(parseRedirectsFormat, fileName, redirectsFilePath))
      .forEach(r => rulesUnique.add(JSON.stringify(r)))
  }
  if (fs.existsSync(configPath)) {
    const fileName = configPath
      .split(path.sep)
      .pop();

    (await parseFile(parseNetlifyConfig, fileName, configPath))
      .forEach(r => rulesUnique.add(JSON.stringify(r)))
  }

  return Array.from(rulesUnique).map(item => JSON.parse(item))
}

async function remove(rule = {}, projectPath) {
  const rules = (await getAll(projectPath)).filter(
    r =>
      !(
        r.from === rule.from &&
        r.to === rule.to &&
        r.status === rule.status &&
        r.force === rule.force &&
        r.query === rule.query &&
        JSON.stringify(r.conditions) === JSON.stringify(rule.conditions) &&
        JSON.stringify(r.headers) === JSON.stringify(rule.headers) &&
        r.signed === rule.signed
      ),
  )

  const configPath = await getConfigPath(undefined, projectPath)
  const config = await resolveConfig(configPath, { cwd: projectPath })

  config.redirects = rules

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

module.exports = { getAll, remove, add }
