const path = require('path')

const chalk = require('chalk')

const { HEADING_PREFIX } = require('./constants')

// If the `dry` option is specified, do a dry run
const doDryRun = function({ buildInstructions, netlifyConfigPath, options: { dry } }) {
  if (!dry) {
    return
  }

  console.log()
  console.log(chalk.cyanBright.bold(`${HEADING_PREFIX} Netlify Build Steps`))
  console.log()

  const width = Math.max(...buildInstructions.map(({ hook }) => hook.length))
  buildInstructions.forEach((instruction, index) =>
    logDryRunInstruction({ instruction, index, netlifyConfigPath, width })
  )

  console.log()
  process.exit(0)
}

const logDryRunInstruction = function({ instruction: { name, hook }, index, netlifyConfigPath, width }) {
  const source = name.startsWith('config.build') ? `in ${path.basename(netlifyConfigPath)}` : 'plugin'
  const count = chalk.cyanBright(`${index + 1}.`)
  const hookName = chalk.white.bold(`${hook.padEnd(width + 2)} `)
  const niceName = name.startsWith('config.build') ? name.replace(/^config\./, '') : name
  const sourceOutput = chalk.white.bold(niceName)
  console.log(chalk.cyanBright(`${count} ${hookName} source ${sourceOutput} ${source} `))
}

module.exports = { doDryRun }
