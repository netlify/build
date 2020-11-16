'use strict'

const { arrowDown } = require('figures')

const { getBuildCommandDescription } = require('../description')
const { logMessage, logSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logDryRunStart = function ({ logs, eventWidth, commandsCount }) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const secondLine = '─'.repeat(columnWidth)

  logSubHeader(logs, 'Netlify Build Commands')
  logMessage(
    logs,
    `For more information on build events see the docs https://github.com/netlify/build

Running \`netlify build\` will execute this build flow

${THEME.header(`┌─${line}─┬─${secondLine}─┐
│ ${DRY_HEADER_NAMES[0].padEnd(columnWidth)} │ ${DRY_HEADER_NAMES[1].padEnd(columnWidth)} │
└─${line}─┴─${secondLine}─┘`)}`,
  )
}

const logDryRunCommand = function ({
  logs,
  command: { event, packageName, buildCommandOrigin, coreCommandName },
  index,
  eventWidth,
  commandsCount,
}) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const line = '─'.repeat(columnWidth)
  const countText = `${index + 1}. `
  const downArrow = commandsCount === index + 1 ? '  ' : ` ${arrowDown}`
  const eventWidthA = columnWidth - countText.length - downArrow.length
  const fullName = getPluginFullName({ packageName, buildCommandOrigin, coreCommandName })

  logMessage(
    logs,
    `${THEME.header(`┌─${line}─┐`)}
${THEME.header(`│ ${countText}${event.padEnd(eventWidthA)}${downArrow} │`)} ${fullName}
${THEME.header(`└─${line}─┘ `)}`,
  )
}

const getPluginFullName = function ({ packageName, buildCommandOrigin, coreCommandName }) {
  if (coreCommandName !== undefined) {
    return coreCommandName
  }

  if (buildCommandOrigin !== undefined) {
    return getBuildCommandDescription(buildCommandOrigin)
  }

  return `Plugin ${THEME.highlightWords(packageName)}`
}

const getDryColumnWidth = function (eventWidth, commandsCount) {
  const symbolsWidth = `${commandsCount}`.length + COLUMN_EXTRA_WIDTH
  return Math.max(eventWidth + symbolsWidth, DRY_HEADER_NAMES[1].length)
}

const COLUMN_EXTRA_WIDTH = 4
const DRY_HEADER_NAMES = ['Event', 'Location']

const logDryRunEnd = function (logs) {
  logMessage(logs, `\nIf this looks good to you, run \`netlify build\` to execute the build\n`)
}

module.exports = {
  logDryRunStart,
  logDryRunCommand,
  logDryRunEnd,
}
