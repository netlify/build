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

async function get(projectPath) {
  const rules = []

  const configPath = await getConfigPath(undefined, projectPath)
  const redirectsFilePath = path.resolve(projectPath, '_redirects')

  if (fs.existsSync(redirectsFilePath)) {
    const fileName = redirectsFilePath.split(path.sep).pop()
    rules.push(...(await parseFile(parseRedirectsFormat, fileName, redirectsFilePath)))
  }
  if (fs.existsSync(configPath)) {
    const fileName = configPath.split(path.sep).pop()
    rules.push(...(await parseFile(parseNetlifyConfig, fileName, configPath)))
  }

  return rules
}

module.exports = { get }
