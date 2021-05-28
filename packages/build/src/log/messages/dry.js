'use strict'

const { arrowDown } = require('figures')

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
  command: { event, packageName, coreCommandDescription },
  index,
  netlifyConfig,
  eventWidth,
  commandsCount,
}) {
  const columnWidth = getDryColumnWidth(eventWidth, commandsCount)
  const fullName = getFullName(coreCommandDescription, netlifyConfig, packageName)
  const line = '─'.repeat(columnWidth)
  const countText = `${index + 1}. `
  const downArrow = commandsCount === index + 1 ? '  ' : ` ${arrowDown}`
  const eventWidthA = columnWidth - countText.length - downArrow.length

  logMessage(
    logs,
    `${THEME.header(`┌─${line}─┐`)}
${THEME.header(`│ ${countText}${event.padEnd(eventWidthA)}${downArrow} │`)} ${fullName}
${THEME.header(`└─${line}─┘ `)}`,
  )
}

const getFullName = function (coreCommandDescription, netlifyConfig, packageName) {
  return coreCommandDescription === undefined
    ? `Plugin ${THEME.highlightWords(packageName)}`
    : coreCommandDescription({ netlifyConfig })
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
