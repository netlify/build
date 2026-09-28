import stringWidth from 'fast-string-width'

const HEADER_MIN_WIDTH = 60
const PADDING_WIDTH = 2

/** Print a rectangular header */
export const getHeader = function (message: string) {
  const messageWidth = stringWidth(message)
  const headerWidth = Math.max(HEADER_MIN_WIDTH, messageWidth)
  const line = '─'.repeat(headerWidth + PADDING_WIDTH * 2)
  const paddingRight = ' '.repeat(PADDING_WIDTH + headerWidth - messageWidth)
  return `${message}${paddingRight}
${line}`
}
