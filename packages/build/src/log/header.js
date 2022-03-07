import stringWidth from 'string-width'

// Print a rectangular header
export const getHeader = function (message) {
  const messageWidth = stringWidth(message)
  const headerWidth = Math.max(HEADER_MIN_WIDTH, messageWidth)
  const line = '─'.repeat(headerWidth + PADDING_WIDTH * 2)
  const paddingLeft = ' '.repeat(PADDING_WIDTH)
  const paddingRight = ' '.repeat(PADDING_WIDTH + headerWidth - messageWidth)
  return `${line}
${paddingLeft}${message}${paddingRight}
${line}`
}

const HEADER_MIN_WIDTH = 60
const PADDING_WIDTH = 2
