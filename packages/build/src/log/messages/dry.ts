import figures from 'figures'

import type { NetlifyConfig } from '../../types/config/netlify_config.js'
import { type Logs, logMessage, logSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

import type { CoreStepDescription, StepDescriptionSource } from './steps.js'

export const logDryRunStart = function ({
  logs,
  eventWidth,
  stepsCount,
}: {
  logs: Logs | undefined
  eventWidth: number
  stepsCount: number
}) {
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
}: {
  logs: Logs | undefined
  step: StepDescriptionSource & { event: string }
  index: number
  netlifyConfig: NetlifyConfig
  eventWidth: number
  stepsCount: number
}) {
  const columnWidth = getDryColumnWidth(eventWidth, stepsCount)
  const fullName = getFullName(coreStepDescription, netlifyConfig, packageName)
  const line = '─'.repeat(columnWidth)
  const countText = `${String(index + 1)}. `
  const downArrow = stepsCount === index + 1 ? '  ' : ` ${figures.arrowDown}`
  const eventWidthA = columnWidth - countText.length - downArrow.length

  logMessage(
    logs,
    `${THEME.header(`┌─${line}─┐`)}
${THEME.header(`│ ${countText}${event.padEnd(eventWidthA)}${downArrow} │`)} ${fullName}
${THEME.header(`└─${line}─┘ `)}`,
  )
}

const getFullName = function (
  coreStepDescription: CoreStepDescription | undefined,
  netlifyConfig: NetlifyConfig,
  packageName: string | undefined,
) {
  return coreStepDescription === undefined
    ? `Plugin ${THEME.highlightWords(packageName)}`
    : coreStepDescription({ netlifyConfig })
}

const getDryColumnWidth = function (eventWidth: number, stepsCount: number) {
  const symbolsWidth = String(stepsCount).length + COLUMN_EXTRA_WIDTH
  return Math.max(eventWidth + symbolsWidth, DRY_HEADER_NAMES[1].length)
}

const COLUMN_EXTRA_WIDTH = 4
const DRY_HEADER_NAMES = ['Event', 'Location'] as const

export const logDryRunEnd = function (logs: Logs | undefined) {
  logMessage(logs, `\nIf this looks good to you, run \`netlify build\` to execute the build\n`)
}
