// https://github.com/netlify/cli/blob/0d183f0d0d44c0f6367fdb5e74d41821958da1d0/src/utils/rules-proxy.js
const fs = require('fs')
const path = require('path')
const redirectParser = require('netlify-redirect-parser')
module.exports = parseRules
function parseRules(projectDir) {
  let rules = []

  const baseRedirectsPath = path.resolve(projectDir, '_redirects')
  if (fs.existsSync(baseRedirectsPath)) {
    rules = rules.concat(
      parseFile(redirectParser.parseRedirectsFormat, '_redirects', fs.readFileSync(baseRedirectsPath, 'utf-8'))
    )
  }

  // const baseTOMLPath = path.resolve(projectDir, 'netlify.toml')
  // if (fs.existsSync(baseTOMLPath)) {
  //   rules = rules.concat(
  //     parseFile(redirectParser.parseTomlFormat, 'base netlify.toml', fs.readFileSync(baseTOMLPath, 'utf-8'))
  //   )
  // }
  return rules
}

function parseFile(parser, name, data) {
  const result = parser(data)
  if (result.errors.length) {
    console.error(`Warnings while parsing ${name} file:`)
    result.errors.forEach(err => {
      console.error(`  ${err.lineNum}: ${err.line} -- ${err.reason}`)
    })
  }
  return result.success
}
