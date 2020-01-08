const fs = require('fs')
const path = require('path')

const { getConfigPath } = require('@netlify/config')
const { parseRedirectsFormat, parseNetlifyConfig } = require('netlify-redirect-parser')

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
    const fileName = redirectsFilePath.split(path.sep).pop()
    (await parseFile(parseRedirectsFormat, fileName, redirectsFilePath))
      .forEach(r => rulesUnique.add(JSON.stringify(r)))
  }
  if (fs.existsSync(configPath)) {
    const fileName = configPath.split(path.sep).pop()
    (await parseFile(parseNetlifyConfig, fileName, configPath))
      .forEach(r => rulesUnique.add(JSON.stringify(r)))
  }

  return Array.from(rulesUnique).map(item => JSON.parse(item))
}

module.exports = { getAll }
