import { THEME } from '../../log/theme.js'
import type { BuildError } from '../types.js'

// Serialize an error object into a title|body string to print in logs
export const serializeLogError = function ({
  fullErrorInfo: { title, severity, message, pluginInfo, locationInfo, tsConfigInfo, errorProps },
}: {
  fullErrorInfo: BuildError
}) {
  const body = getBody({ message, pluginInfo, locationInfo, tsConfigInfo, errorProps, severity })
  return { title, body }
}

const getBody = function ({
  message,
  pluginInfo,
  locationInfo,
  tsConfigInfo,
  errorProps,
  severity,
}: Pick<BuildError, 'message' | 'pluginInfo' | 'locationInfo' | 'tsConfigInfo' | 'errorProps' | 'severity'>) {
  if (severity === 'none') {
    return message
  }

  const blocks: Block[] = [
    ['message', message],
    ['tsConfigInfo', tsConfigInfo],
    ['pluginInfo', pluginInfo],
    ['locationInfo', locationInfo],
    ['errorProps', errorProps],
  ]
  return blocks.filter(blockHasValue).map(serializeBlock).join('\n\n')
}

type Block = [BlockName, string | undefined]

const blockHasValue = function (block: Block): block is [BlockName, string] {
  const [, value] = block
  return value !== undefined
}

const serializeBlock = function ([key, value]: [BlockName, string]) {
  return `${THEME.errorSubHeader(LOG_BLOCK_NAMES[key])}\n${value}`
}

type BlockName = keyof typeof LOG_BLOCK_NAMES

const LOG_BLOCK_NAMES = {
  message: 'Error message',
  pluginInfo: 'Plugin details',
  locationInfo: 'Error location',
  tsConfigInfo: 'TypeScript configuration',
  errorProps: 'Error properties',
}
