#!/usr/bin/env node
const chalk = require('chalk')
const build = require('./build')
const hasConfig = require('./utils/hasConfig')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

async function execBuild() {
  console.log(chalk.greenBright.bold(`Starting Netlify Build`))
  console.log()
  // Automatically resolve the config path
  const configPath = await hasConfig(process.cwd())

  console.log(chalk.cyanBright.bold(`Using config file:`))
  console.log(configPath)
  console.log()
  // Then run build lifecycle
  build(configPath, args).catch((e) => {
    console.log(e)
  })
}

execBuild().catch((e) => {
  console.log(e)
})
