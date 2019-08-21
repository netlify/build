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
  await build(configPath, args)
}

execBuild().then(() => {
  const sparkles = chalk.cyanBright('(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧')
  console.log(`\n${sparkles} Finished with the build process!\n`)
}).catch((e) => {
  console.log(e)
})
