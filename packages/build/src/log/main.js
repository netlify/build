const { basename } = require('path')
const { platform } = require('process')

const { tick, pointer, arrowDown } = require('figures')
const stringWidth = require('string-width')
const { greenBright, cyanBright, redBright, yellowBright, bold, white } = require('chalk')
const filterObj = require('filter-obj')

const { version } = require('../../package.json')

const { log } = require('./logger')
const { cleanStacks } = require('./stack.js')

const HEADING_PREFIX = pointer
const SUBTEXT_PADDING = '  '

const logBuildStart = function() {
  log(`${greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build v${version}`)}
${SUBTEXT_PADDING}https://github.com/netlify/build
`)
}

const logOptions = function(options) {
  const optionsA = filterObj(options, isDefined)
  if (Object.keys(optionsA).length !== 0) {
    log(cyanBright.bold('Options'), optionsA, '')
  }
}

const isDefined = function(key, value) {
  return value !== undefined
}

const logConfigPath = function(configPath) {
  if (configPath === undefined) {
    log(`${cyanBright.bold(`${HEADING_PREFIX} No config file was defined: using default values.`)}`)
    return
  }

  log(`${cyanBright.bold(`${HEADING_PREFIX} Using config file:`)}
${SUBTEXT_PADDING}${configPath}
`)
}

const logInstallPlugins = function() {
  log(cyanBright.bold(`${HEADING_PREFIX} Installing plugins dependencies`))
}

const logLoadPlugins = function() {
  log(cyanBright.bold(`\n${HEADING_PREFIX} Loading plugins`))
}

const logLoadPlugin = function(id, type, core) {
  const idA = id === undefined ? '' : `"${id}" `
  const location = core ? 'build core' : type
  log(yellowBright(`${SUBTEXT_PADDING}Loading plugin ${idA}from ${location}`))
}

const logLifeCycleStart = function(instructionsCount) {
  const stepsWord = instructionsCount === 1 ? 'step' : `steps`
  log(`\n${greenBright.bold(`${HEADING_PREFIX} Running Netlify Build Lifecycle`)}
${SUBTEXT_PADDING}Found ${instructionsCount} ${stepsWord}. Lets do this!`)
}

const logDryRunStart = function(hookWidth, instructionsCount) {
  const columnWidth = getDryColumnWidth(hookWidth, instructionsCount)
  const line = '─'.repeat(columnWidth)
  const secondLine = '─'.repeat(columnWidth)

  log(`
${cyanBright.bold(`${HEADING_PREFIX} Netlify Build Steps`)}
${SUBTEXT_PADDING}For more information on build lifecycles see the docs https://github.com/netlify/build

${SUBTEXT_PADDING}Running \`netlify build\` will execute this build flow

${bold(`${SUBTEXT_PADDING}┌─${line}─┬─${secondLine}─┐
${SUBTEXT_PADDING}│ ${DRY_HEADER_NAMES[0].padEnd(columnWidth)} │ ${DRY_HEADER_NAMES[1].padEnd(columnWidth)} │
${SUBTEXT_PADDING}└─${line}─┴─${secondLine}─┘`)}`)
}

const logDryRunInstruction = function({
  instruction: { id, hook, type, core },
  index,
  configPath,
  hookWidth,
  instructionsCount,
}) {
  const columnWidth = getDryColumnWidth(hookWidth, instructionsCount)
  const line = '─'.repeat(columnWidth)
  const countText = `${index + 1}. `
  const downArrow = instructionsCount === index + 1 ? '  ' : ` ${arrowDown}`
  const hookNameWidth = columnWidth - countText.length - downArrow.length
  const location = getPluginLocation({ id, type, core, configPath })

  log(
    cyanBright.bold(`${SUBTEXT_PADDING}┌─${line}─┐
${SUBTEXT_PADDING}│ ${cyanBright(countText)}${hook.padEnd(hookNameWidth)}${downArrow} │ ${location}
${SUBTEXT_PADDING}└─${line}─┘ `),
  )
}

const getPluginLocation = function({ id, type, core, configPath }) {
  if (id.startsWith('config.')) {
    return `${white('Config')} ${cyanBright(basename(configPath))} ${yellowBright(id.replace('config.', ''))}`
  }

  if (core) {
    return `${white('Plugin')} ${yellowBright(id)} in build core`
  }

  return `${white('Plugin')} ${id} ${yellowBright(type)}`
}

const getDryColumnWidth = function(hookWidth, instructionsCount) {
  const symbolsWidth = `${instructionsCount}`.length + 4
  return Math.max(hookWidth + symbolsWidth, DRY_HEADER_NAMES[0].length)
}

const DRY_HEADER_NAMES = ['Lifecycle Hook', 'Location']

const logDryRunEnd = function() {
  log(`
${SUBTEXT_PADDING}If this looks good to you, run \`netlify build\` to execute the build
`)
}

const logInstruction = function({ hook, id, override }, { index, configPath, error }) {
  const overrideWarning =
    override.hook === undefined
      ? ''
      : redBright(`
${HEADING_PREFIX} OVERRIDE: "${override.hook}" method in "${override.name}" has been overriden by "${id}"`)
  const lifecycleName = error ? '' : 'lifecycle '
  const source = id.startsWith('config.build') ? ` in ${basename(configPath)} config file` : ''
  const niceName = id.startsWith('config.build') ? id.replace(/^config\./, '') : id
  const logColor = error ? redBright.bold : cyanBright.bold
  const header = `${index + 1}. Running ${bold(hook)} ${lifecycleName}from ${bold(niceName)}${source}`
  log(logColor(`${overrideWarning}\n${getHeader(header)}\n`))
}

const logCommandStart = function(cmd) {
  log(yellowBright(`Running command "${cmd}"`))
}

const logInstructionSuccess = function() {
  log('')
}

const logTimer = function(durationMs, hook, id) {
  const hookA = hook ? `.${bold(hook)}` : ''
  const idA = id.replace('config.', '')
  const idB = idA.startsWith('build.lifecycle') ? 'build.lifecycle' : idA

  log(` ${greenBright(tick)}  ${greenBright.bold(idB)}${hookA} completed in ${durationMs}ms`)
}

const logCacheStart = function() {
  log(cyanBright.bold(`${HEADING_PREFIX} Caching artifacts`))
}

const logCacheDir = function(path) {
  log(`${SUBTEXT_PADDING}Caching ${path}`)
}

const logBuildError = function(error) {
  const errorStack = error.cleanStack ? cleanStacks(error.message) : `\n${error.stack}`
  log(`${redBright.bold(`\n${getHeader('Netlify Build Error')}`)}
${errorStack}
`)
}

const logBuildSuccess = function() {
  log(greenBright.bold(`\n${getHeader('Netlify Build Complete')}\n`))
}

const logBuildEnd = function() {
  log(`\n${cyanBright(SPARKLES)} Have a nice day!\n`)
}

const SPARKLES = platform === 'win32' ? '(/Ò_Ò)/' : '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'

// Print a rectangular header
const getHeader = function(message) {
  const messageWidth = stringWidth(message)
  const headerWidth = Math.max(HEADER_MIN_WIDTH, messageWidth + MIN_PADDING * 2)
  const line = '─'.repeat(headerWidth)
  const paddingWidth = (headerWidth - messageWidth) / 2
  const paddingLeft = ' '.repeat(Math.floor(paddingWidth))
  const paddingRight = ' '.repeat(Math.ceil(paddingWidth))
  return `┌${line}┐
│${paddingLeft}${message}${paddingRight}│
└${line}┘`
}

const HEADER_MIN_WIDTH = 29
const MIN_PADDING = 1

module.exports = {
  logBuildStart,
  logOptions,
  logConfigPath,
  logInstallPlugins,
  logLoadPlugins,
  logLoadPlugin,
  logLifeCycleStart,
  logDryRunStart,
  logDryRunInstruction,
  logDryRunEnd,
  logInstruction,
  logCommandStart,
  logInstructionSuccess,
  logTimer,
  logCacheStart,
  logCacheDir,
  logBuildError,
  logBuildSuccess,
  logBuildEnd,
}
