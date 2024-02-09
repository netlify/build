import figures from 'figures'

import { logMessage, logSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

export const logDryRunStart = function ({ logs, eventWidth, stepsCount }) {
  const columnWidth = getDryColumnWidth(eventWidth, stepsCount)
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

export const logDryRunStep = function ({
  logs,
  step: { event, packageName, coreStepDescription },
  index,
  netlifyConfig,
  eventWidth,
  stepsCount,
}) {
  const columnWidth = getDryColumnWidth(eventWidth, stepsCount)
  const fullName = getFullName(coreStepDescription, netlifyConfig, packageName)
  const line = '─'.repeat(columnWidth)
  const countText = `${index + 1}. `
  const downArrow = stepsCount === index + 1 ? '  ' : ` ${figures.arrowDown}`
  const eventWidthA = columnWidth - countText.length - downArrow.length

  logMessage(
    logs,
    `${THEME.header(`┌─${line}─┐`)}
${THEME.header(`│ ${countText}${event.padEnd(eventWidthA)}${downArrow} │`)} ${fullName}
${THEME.header(`└─${line}─┘ `)}`,
  )
}

const getFullName = function (coreStepDescription, netlifyConfig, packageName) {
  return coreStepDescription === undefined
    ? `Plugin ${THEME.highlightWords(packageName)}`
    : coreStepDescription({ netlifyConfig })
}

const getDryColumnWidth = function (eventWidth, stepsCount) {
  const symbolsWidth = `${stepsCount}`.length + COLUMN_EXTRA_WIDTH
  return Math.max(eventWidth + symbolsWidth, DRY_HEADER_NAMES[1].length)
}

const COLUMN_EXTRA_WIDTH = 4
const DRY_HEADER_NAMES = ['Event', 'Location']

export const logDryRunEnd = function (logs) {
  logMessage(logs, `\nIf this looks good to you, run \`netlify build\` to execute the build\n`)
}
